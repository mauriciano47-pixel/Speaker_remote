package com.example.speakerremote.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class BluetoothSpeakerDevice(
    val name: String,
    val address: String,
    val rssi: Int,
    val isConnected: Boolean = false,
    val type: String = "Bluetooth Speaker"
)

class BluetoothSpeakerManager(private val context: Context) {
    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        manager.adapter
    }

    private val _discoveredDevices = MutableStateFlow<List<BluetoothSpeakerDevice>>(emptyList())
    val discoveredDevices: StateFlow<List<BluetoothSpeakerDevice>> = _discoveredDevices

    private val _connectedDevice = MutableStateFlow<BluetoothSpeakerDevice?>(null)
    val connectedDevice: StateFlow<BluetoothSpeakerDevice?> = _connectedDevice

    @SuppressLint("MissingPermission")
    fun getPairedDevices(): List<BluetoothSpeakerDevice> {
        val paired = bluetoothAdapter?.bondedDevices ?: emptySet()
        return paired.map { device ->
            BluetoothSpeakerDevice(
                name = device.name ?: "Dispositivo Bluetooth",
                address = device.address,
                rssi = -60,
                isConnected = true,
                type = getDeviceTypeName(device.bluetoothClass?.majorDeviceClass ?: 0)
            )
        }
    }

    private fun getDeviceTypeName(majorClass: Int): String {
        return when (majorClass) {
            1024 -> "Parlante Surround / Audio"
            1028 -> "Audífonos Bluetooth"
            1048 -> "Equipo de Sonido / Car Audio"
            else -> "Parlante Bluetooth"
        }
    }

    fun startDiscovery() {
        val demoList = listOf(
            BluetoothSpeakerDevice("JBL Flip 6 Surround", "00:11:22:33:44:55", -45, isConnected = true, "Parlante Bluetooth"),
            BluetoothSpeakerDevice("Sony SRS-XB33 Extra Bass", "AA:BB:CC:DD:EE:FF", -62, isConnected = false, "Equipo de Sonido"),
            BluetoothSpeakerDevice("Bose SoundLink Flex", "12:34:56:78:90:AB", -75, isConnected = false, "Parlante Portátil"),
            BluetoothSpeakerDevice("Marshall Emberton II", "99:88:77:66:55:44", -58, isConnected = false, "Parlante Studio")
        )
        _discoveredDevices.value = demoList
        _connectedDevice.value = demoList.first()
    }
}
