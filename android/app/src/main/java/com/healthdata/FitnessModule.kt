package com.healthdata

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.gms.fitness.FitnessLocal
import com.google.android.gms.fitness.LocalRecordingClient
import com.google.android.gms.fitness.data.LocalBucket
import com.google.android.gms.fitness.data.LocalDataSet
import com.google.android.gms.fitness.data.LocalDataType
import com.google.android.gms.fitness.data.LocalField
import com.google.android.gms.fitness.request.LocalDataReadRequest
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.TimeUnit

@SuppressLint("MissingPermission")
class FitnessModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        private const val TAG = "FitnessModule"
        private const val REQUEST_ACTIVITY_RECOGNITION = 1001
        
        @Volatile
        var instance: FitnessModule? = null
            private set
    }

    private val appContext: ReactApplicationContext = reactContext

    private val localRecordingClient: LocalRecordingClient by lazy {
        FitnessLocal.getLocalRecordingClient(appContext)
    }

    private var permissionPromise: Promise? = null

    private data class BucketData(
        val steps: Int,
        val distance: Double,
        val calories: Double
    )

    init {
        reactContext.addActivityEventListener(this)
        instance = this
    }

    override fun getName(): String = "FitnessModule"

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        if (instance == this) {
            instance = null
        }
        reactApplicationContext.removeActivityEventListener(this)
    }

    private fun hasActivityRecognitionPermission(): Boolean =
        ContextCompat.checkSelfPermission(
            appContext,
            Manifest.permission.ACTIVITY_RECOGNITION
        ) == PackageManager.PERMISSION_GRANTED

    private fun checkPlayServicesOrReject(promise: Promise): Boolean {
        val status = GoogleApiAvailability
            .getInstance()
            .isGooglePlayServicesAvailable(appContext)

        if (status != ConnectionResult.SUCCESS) {
            promise.reject(
                "PLAY_SERVICES_ERROR",
                "Google Play services is not available or not up to date (status=$status)."
            )
            return false
        }
        return true
    }

    private fun checkEnvironmentOrReject(promise: Promise): Boolean {
        if (!hasActivityRecognitionPermission()) {
            promise.reject(
                "PERMISSION_DENIED",
                "android.permission.ACTIVITY_RECOGNITION is not granted (request it on the JS side before calling the native module)."
            )
            return false
        }

        if (!checkPlayServicesOrReject(promise)) {
            return false
        }

        return true
    }

    @ReactMethod
    fun checkPermission(promise: Promise) {
        promise.resolve(hasActivityRecognitionPermission())
    }

    @ReactMethod
    fun subscribeToDataTypes(promise: Promise) {
        if (!checkPlayServicesOrReject(promise)) return
        
        if (!hasActivityRecognitionPermission()) {
            promise.reject(
                "PERMISSION_DENIED",
                "android.permission.ACTIVITY_RECOGNITION is not granted."
            )
            return
        }
        
        subscribeToDataTypesInternal(promise)
    }

    private fun subscribeToDataTypesInternal(promise: Promise) {
        localRecordingClient.subscribe(LocalDataType.TYPE_STEP_COUNT_DELTA)
            .addOnSuccessListener {
                localRecordingClient.subscribe(LocalDataType.TYPE_DISTANCE_DELTA)
                    .addOnSuccessListener {
                        localRecordingClient.subscribe(LocalDataType.TYPE_CALORIES_EXPENDED)
                            .addOnSuccessListener {
                                promise.resolve(true)
                            }
                            .addOnFailureListener { e ->
                                promise.reject(
                                    "SUBSCRIBE_ERROR",
                                    "Error subscribing to calories (TYPE_CALORIES_EXPENDED).",
                                    e
                                )
                            }
                    }
                    .addOnFailureListener { e ->
                        promise.reject(
                            "SUBSCRIBE_ERROR",
                            "Error subscribing to distance (TYPE_DISTANCE_DELTA).",
                            e
                        )
                    }
            }
            .addOnFailureListener { e ->
                promise.reject(
                    "SUBSCRIBE_ERROR",
                    "Error subscribing to steps (TYPE_STEP_COUNT_DELTA).",
                    e
                )
            }
    }

    @ReactMethod
    fun requestPermissions(promise: Promise) {
        if (!checkPlayServicesOrReject(promise)) return

        if (hasActivityRecognitionPermission()) {
            subscribeToDataTypesInternal(promise)
            return
        }

        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject(
                "NO_ACTIVITY",
                "No activity available to request permission."
            )
            return
        }

        permissionPromise = promise

        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.ACTIVITY_RECOGNITION),
            REQUEST_ACTIVITY_RECOGNITION
        )
    }


    private fun buildReadRequest(days: Long, isToday: Boolean = false): LocalDataReadRequest {
        val zone = ZoneId.systemDefault()
        val endTime = LocalDateTime.now().atZone(zone)
        val startTime = if (isToday) {
            LocalDateTime.now().toLocalDate().atStartOfDay(zone)
        } else {
            endTime.minusDays(days)
        }

        return LocalDataReadRequest.Builder()
            .aggregate(LocalDataType.TYPE_STEP_COUNT_DELTA)
            .aggregate(LocalDataType.TYPE_DISTANCE_DELTA)
            .aggregate(LocalDataType.TYPE_CALORIES_EXPENDED)
            .bucketByTime(1, TimeUnit.DAYS)
            .setTimeRange(startTime.toEpochSecond(), endTime.toEpochSecond(), TimeUnit.SECONDS)
            .build()
    }

    @ReactMethod
    fun getTodaysSteps(promise: Promise) {
        if (!checkEnvironmentOrReject(promise)) return

        val readRequest = buildReadRequest(1, isToday = true)

        localRecordingClient.readData(readRequest)
            .addOnSuccessListener { response ->
                try {
                    val bucketDataList = readStepsData(response.buckets)

                    val steps = bucketDataList.sumOf { it.steps }
                    val distance = bucketDataList.sumOf { it.distance }
                    val calories = bucketDataList.sumOf { it.calories }

                    val result = Arguments.createMap().apply {
                        putInt("steps", steps)
                        putDouble("distance", distance)
                        putDouble("calories", calories)
                    }
                    promise.resolve(result)
                } catch (t: Throwable) {
                    Log.d(TAG, "Error while processing Recording API data.", t)
                    promise.reject(
                        "PROCESSING_ERROR",
                        "Error while processing Recording API data.",
                        t
                    )
                }
            }
            .addOnFailureListener { e ->
                promise.reject(
                    "DATA_READ_ERROR",
                    "Error reading Recording API data (today).",
                    e
                )
            }
    }

    @ReactMethod
    fun getWeeklySteps(promise: Promise) {
        if (!checkEnvironmentOrReject(promise)) return

        val readRequest = buildReadRequest(60)

        localRecordingClient.readData(readRequest)
            .addOnSuccessListener { response ->
                try {
                    val bucketDataList = readStepsData(response.buckets)

                    val stepsArray = Arguments.createArray()
                    val distanceArray = Arguments.createArray()
                    val caloriesArray = Arguments.createArray()

                    bucketDataList.forEach { bucketData ->
                        stepsArray.pushInt(bucketData.steps)
                        distanceArray.pushDouble(bucketData.distance)
                        caloriesArray.pushDouble(bucketData.calories)
                    }

                    val result = Arguments.createMap().apply {
                        putArray("steps", stepsArray)
                        putArray("distance", distanceArray)
                        putArray("calories", caloriesArray)
                    }
                    promise.resolve(result)
                } catch (t: Throwable) {
                    promise.reject(
                        "PROCESSING_ERROR",
                        "Error while processing Recording API data (weekly).",
                        t
                    )
                }
            }
            .addOnFailureListener { e ->
                promise.reject(
                    "DATA_READ_ERROR",
                    "Error reading Recording API data (weekly).",
                    e
                )
            }
    }

    private fun sumIntField(dataSet: LocalDataSet, field: LocalField): Int =
        dataSet.dataPoints.sumOf { it.getValue(field).asInt() }

    private fun sumFloatField(dataSet: LocalDataSet, field: LocalField): Double =
        dataSet.dataPoints.sumOf { it.getValue(field).asFloat().toDouble() }

    private fun readStepsData(buckets: List<LocalBucket>): List<BucketData> {
        return buckets.map { bucket ->
            var steps = 0
            var distance = 0.0
            var calories = 0.0

            bucket.dataSets.forEach { dataSet ->
                when (dataSet.dataType) {
                    LocalDataType.TYPE_STEP_COUNT_DELTA ->
                        steps += sumIntField(dataSet, LocalField.FIELD_STEPS)

                    LocalDataType.TYPE_DISTANCE_DELTA ->
                        distance += sumFloatField(dataSet, LocalField.FIELD_DISTANCE)

                    LocalDataType.TYPE_CALORIES_EXPENDED ->
                        calories += sumFloatField(dataSet, LocalField.FIELD_CALORIES)
                }
            }

            BucketData(steps, distance, calories)
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) = Unit

    override fun onNewIntent(intent: Intent) = Unit

    fun onRequestPermissionsResult(
        requestCode: Int,
        grantResults: IntArray
    ) {
        if (requestCode != REQUEST_ACTIVITY_RECOGNITION) return

        val promise = permissionPromise
        permissionPromise = null

        if (promise == null) {
            Log.d(TAG, "Permission result received but no promise found")
            return
        }

        if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            subscribeToDataTypesInternal(promise)
        } else {
            promise.reject(
                "PERMISSION_DENIED",
                "The user denied the ACTIVITY_RECOGNITION permission."
            )
        }
    }
}
