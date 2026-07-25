package com.example.speakerremote

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.speakerremote.audio.AudioFocusController
import com.example.speakerremote.bluetooth.BluetoothSpeakerDevice
import com.example.speakerremote.bluetooth.BluetoothSpeakerManager

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SpeakerRemoteTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SpeakerRemoteApp()
                }
            }
        }
    }
}

@Composable
fun SpeakerRemoteTheme(content: @Composable () -> Unit) {
    val darkColors = darkColorScheme(
        primary = Color(0xFF6C5CE7),
        secondary = Color(0xFF00CEC9),
        background = Color(0xFF0D0D12),
        surface = Color(0xFF181822),
        onPrimary = Color.White,
        onBackground = Color.White,
        onSurface = Color.White
    )
    MaterialTheme(
        colorScheme = darkColors,
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpeakerRemoteApp() {
    val context = LocalContext.current
    val audioController = remember { AudioFocusController(context) }
    val bluetoothManager = remember { BluetoothSpeakerManager(context) }

    var isConnected by remember { mutableStateOf(true) }
    var currentDeviceName by remember { mutableStateOf("JBL Flip 6 Surround") }
    var volumeLevel by remember { mutableFloatStateOf(audioController.getVolumePercent().toFloat()) }
    var isMuted by remember { mutableStateOf(false) }
    var isPlaying by remember { mutableStateOf(true) }
    var isInterruptingFocus by remember { mutableStateOf(false) }
    var selectedInputMode by remember { mutableStateOf("Bluetooth") }
    var showDeviceList by remember { mutableStateOf(false) }
    var bassBoost by remember { mutableFloatStateOf(6f) }

    LaunchedEffect(Unit) {
        bluetoothManager.startDiscovery()
    }

    val gradientBg = Brush.verticalGradient(
        colors = listOf(Color(0xFF141420), Color(0xFF09090D))
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(gradientBg)
            .padding(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Speaker Remote Pro",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(if (isConnected) Color(0xFF00CEC9) else Color(0xFFFF7675))
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isConnected) "Conectado: $currentDeviceName" else "Sin conexión Bluetooth",
                        fontSize = 12.sp,
                        color = Color.LightGray
                    )
                }
            }

            IconButton(
                onClick = { showDeviceList = !showDeviceList },
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFF232334))
            ) {
                Icon(
                    imageVector = Icons.Default.BluetoothSearching,
                    contentDescription = "Buscar Parlantes",
                    tint = Color(0xFF00CEC9)
                )
            }
        }

        // Bluetooth Signal Interrupter Card (Bypass & Focus Takeover)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isInterruptingFocus) Color(0xFF2D1537) else Color(0xFF1D1D2B)
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.SignalCellularConnectedNoSim,
                            contentDescription = "Interrupción Audio Focus",
                            tint = if (isInterruptingFocus) Color(0xFFFF007F) else Color(0xFF00CEC9)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Interrupción de Señal Audio Focus",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                    Switch(
                        checked = isInterruptingFocus,
                        onCheckedChange = { active ->
                            if (active) {
                                val granted = audioController.requestExclusiveAudioFocus { hasFocus ->
                                    isInterruptingFocus = hasFocus
                                }
                                if (granted) {
                                    Toast.makeText(context, "Señal Interrumpida: Control exclusivo concedido", Toast.LENGTH_SHORT).show()
                                }
                            } else {
                                audioController.abandonAudioFocus()
                                isInterruptingFocus = false
                                Toast.makeText(context, "Señal liberada", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFFFF007F)
                        )
                    )
                }
                if (isInterruptingFocus) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "⚠️ Interrumpiendo reproducción de otros dispositivos en el parlante",
                        fontSize = 11.sp,
                        color = Color(0xFFFF7675)
                    )
                }
            }
        }

        // Mode Input Selectors
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF1B1B26))
                .padding(4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            val modes = listOf("Bluetooth", "AUX", "Óptico", "USB")
            modes.forEach { mode ->
                val selected = mode == selectedInputMode
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (selected) Color(0xFF6C5CE7) else Color.Transparent)
                        .clickable { selectedInputMode = mode }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = mode,
                        fontSize = 12.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                        color = if (selected) Color.White else Color.Gray
                    )
                }
            }
        }

        // Master Volume & Mute Panel
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF181824))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Nivel de Volumen Master",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = if (isMuted) "MUTE ACTIVO" else "${volumeLevel.toInt()}%",
                    fontSize = 46.sp,
                    fontWeight = FontWeight.Black,
                    color = if (isMuted) Color(0xFFFF7675) else Color(0xFF00CEC9)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    IconButton(onClick = {
                        isMuted = !isMuted
                        audioController.toggleMute(isMuted)
                    }) {
                        Icon(
                            imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeDown,
                            contentDescription = "Mute",
                            tint = if (isMuted) Color(0xFFFF7675) else Color.White
                        )
                    }
                    Slider(
                        value = if (isMuted) 0f else volumeLevel,
                        onValueChange = {
                            volumeLevel = it
                            if (isMuted && it > 0) isMuted = false
                            audioController.setVolume(it.toInt())
                        },
                        valueRange = 0f..100f,
                        modifier = Modifier.weight(1f),
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFF00CEC9),
                            activeTrackColor = Color(0xFF6C5CE7)
                        )
                    )
                    IconButton(onClick = {
                        volumeLevel = 100f
                        audioController.setVolume(100)
                    }) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Máximo Volumen",
                            tint = Color.White
                        )
                    }
                }
            }
        }

        // Bass & Equalizer Control
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1D1D2B))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Bass Boost Amplificador", fontSize = 13.sp, color = Color.Gray)
                    Text(
                        text = "+${bassBoost.toInt()} dB",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF6C5CE7)
                    )
                }
                Slider(
                    value = bassBoost,
                    onValueChange = { bassBoost = it },
                    valueRange = 0f..12f,
                    modifier = Modifier.width(180.dp),
                    colors = SliderDefaults.colors(
                        thumbColor = Color(0xFF6C5CE7),
                        activeTrackColor = Color(0xFF00CEC9)
                    )
                )
            }
        }

        // Media Playback Controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { Toast.makeText(context, "Pista Anterior", Toast.LENGTH_SHORT).show() },
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF232334))
            ) {
                Icon(imageVector = Icons.Default.SkipPrevious, contentDescription = "Pista Anterior", tint = Color.White)
            }

            FloatingActionButton(
                onClick = { isPlaying = !isPlaying },
                shape = CircleShape,
                containerColor = Color(0xFF6C5CE7),
                contentColor = Color.White,
                modifier = Modifier.size(68.dp)
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = "Play/Pause",
                    modifier = Modifier.size(34.dp)
                )
            }

            IconButton(
                onClick = { Toast.makeText(context, "Pista Siguiente", Toast.LENGTH_SHORT).show() },
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF232334))
            ) {
                Icon(imageVector = Icons.Default.SkipNext, contentDescription = "Pista Siguiente", tint = Color.White)
            }
        }
    }
}
