package com.healthdata

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "HealthData"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        try {
            FitnessModule.instance?.onRequestPermissionsResult(requestCode, grantResults)
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "Error handling permission result", e)
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }
}
