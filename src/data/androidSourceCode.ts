import { AndroidCodeFile } from '../types';

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    name: 'BlackoutActivity.kt',
    path: 'app/src/main/java/com/app/blackoutscreen/BlackoutActivity.kt',
    language: 'kotlin',
    description: 'Actividad que oscurece la pantalla, reduce el brillo a 0.001f, mantiene el dispositivo despierto y detecta el doble toque para salir.',
    content: `package com.app.blackoutscreen

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/**
 * Actividad de Pantalla Negra (Blackout Mode).
 * 1. Brillo de pantalla al mínimo posible (0.001f).
 * 2. Mantiene la pantalla encendida sin entrar en suspensión (FLAG_KEEP_SCREEN_ON).
 * 3. Oculta barras de estado y navegación (Inmersión total).
 * 4. Capa negra OLED con detección de doble toque (Double Tap) para reactivar.
 */
class BlackoutActivity : AppCompatActivity() {

    private lateinit var gestureDetector: GestureDetector
    private var blackoutLayout: FrameLayout? = null
    private var hintText: TextView? = null

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_blackout)

        blackoutLayout = findViewById(R.id.blackoutRoot)
        hintText = findViewById(R.id.tvHint)

        // 1. Mantener pantalla encendida (sin suspender CPU ni pantalla)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // 2. Reducir brillo al mínimo físico permitido por Android (0.001f = 0.1%)
        val layoutParams = window.attributes
        layoutParams.screenBrightness = 0.001f
        window.attributes = layoutParams

        // 3. Ocultar barras del sistema para inmersión total (Full Screen)
        hideSystemBars()

        // 4. Configurar detector de gestos (Doble toque para desbloquear)
        gestureDetector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDoubleTap(e: MotionEvent): Boolean {
                // Retroalimentación háptica (vibración leve)
                triggerVibration()

                // Finalizar la actividad y restaurar brillo anterior
                finish()
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                return true
            }

            override fun onSingleTapConfirmed(e: MotionEvent): Boolean {
                // Mostrar brevemente un aviso casi imperceptible por si el usuario olvidó el gesto
                showTemporaryHint()
                return true
            }
        })

        // Escuchar toques en la capa negra completa
        blackoutLayout?.setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            true
        }
    }

    private fun hideSystemBars() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
    }

    private fun showTemporaryHint() {
        hintText?.visibility = View.VISIBLE
        hintText?.alpha = 0.4f
        hintText?.postDelayed({
            hintText?.animate()?.alpha(0f)?.setDuration(400)?.withEndAction {
                hintText?.visibility = View.GONE
            }?.start()
        }, 1200)
    }

    private fun triggerVibration() {
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        vibrator?.let {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                it.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                it.vibrate(50)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Al destruirse, los parámetros de brillo de la ventana se restauran automáticamente
        // al nivel general del sistema.
    }
}
`,
  },
  {
    name: 'FloatingBlackoutService.kt',
    path: 'app/src/main/java/com/app/blackoutscreen/FloatingBlackoutService.kt',
    language: 'kotlin',
    description: 'Servicio en primer plano que muestra la burbuja o botón flotante sobre cualquier app (similar al grabador de pantalla).',
    content: `package com.app.blackoutscreen

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import kotlin.math.abs

/**
 * Servicio encargado del botón flotante tipo "Assistive / Screen Recorder".
 * Aparece superpuesto en cualquier pantalla y permite:
 * - Arrastrarlo a cualquier lado de la pantalla.
 * - Al tocarlo (clic rápido), abre BlackoutActivity para oscurecer la pantalla.
 */
class FloatingBlackoutService : Service() {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private lateinit var params: WindowManager.LayoutParams

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var isDragging = false

    companion object {
        const val CHANNEL_ID = "blackout_overlay_channel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    @SuppressLint("InflateParams", "ClickableViewAccessibility")
    override fun onCreate() {
        super.onCreate()

        startForegroundServiceWithNotification()

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        // Layout inflado para la burbuja flotante
        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_bubble, null)

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 50
            y = 200
        }

        windowManager.addView(floatingView, params)

        val btnBubble = floatingView?.findViewById<ImageView>(R.id.ivBubbleIcon)

        // Gestión de gestos táctiles (Drag & Drop y Clic)
        btnBubble?.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    isDragging = false
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = (event.rawX - initialTouchX).toInt()
                    val deltaY = (event.rawY - initialTouchY).toInt()

                    // Solo considerar arrastre si se mueve más de 12 píxeles
                    if (abs(deltaX) > 12 || abs(deltaY) > 12) {
                        isDragging = true
                        params.x = initialX + deltaX
                        params.y = initialY + deltaY
                        windowManager.updateViewLayout(floatingView, params)
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (!isDragging) {
                        // Fue un clic: Activar Pantalla Negra
                        activateBlackout()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun activateBlackout() {
        val intent = Intent(this, BlackoutActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        startActivity(intent)
    }

    private fun startForegroundServiceWithNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Botón Flotante Pantalla Negra",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Servicio activo para botón de pantalla oscura"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Blackout Screen activo")
            .setContentText("Toca la burbuja en pantalla para oscurecer el teléfono")
            .setSmallIcon(android.R.drawable.ic_lock_power_off)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (floatingView != null) {
            windowManager.removeView(floatingView)
            floatingView = null
        }
    }
}
`,
  },
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/app/blackoutscreen/MainActivity.kt',
    language: 'kotlin',
    description: 'Actividad principal con interruptor para iniciar/detener el servicio flotante y solicitar permisos requeridos.',
    content: `package com.app.blackoutscreen

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val OVERLAY_PERMISSION_REQ_CODE = 2001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnStart = findViewById<Button>(R.id.btnStartService)
        val btnStop = findViewById<Button>(R.id.btnStopService)
        val btnTestNow = findViewById<Button>(R.id.btnTestNow)

        btnStart.setOnClickListener {
            checkOverlayPermissionAndStart()
        }

        btnStop.setOnClickListener {
            stopService(Intent(this, FloatingBlackoutService::class.java))
            Toast.makeText(this, "Botón flotante desactivado", Toast.LENGTH_SHORT).show()
        }

        btnTestNow.setOnClickListener {
            startActivity(Intent(this, BlackoutActivity::class.java))
        }
    }

    private fun checkOverlayPermissionAndStart() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(this)) {
                Toast.makeText(
                    this,
                    "Concede el permiso para mostrar sobre otras aplicaciones",
                    Toast.LENGTH_LONG
                ).show()
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:\$packageName")
                )
                startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE)
            } else {
                startFloatingService()
            }
        } else {
            startFloatingService()
        }
    }

    private fun startFloatingService() {
        val serviceIntent = Intent(this, FloatingBlackoutService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
        Toast.makeText(this, "Burbuja flotante activada", Toast.LENGTH_SHORT).show()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == OVERLAY_PERMISSION_REQ_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(this)) {
                startFloatingService()
            } else {
                Toast.makeText(this, "Permiso denegado: no se puede mostrar el botón", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifiesto de Android con permisos de superposición, mantener pantalla activa y servicios en primer plano.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.app.blackoutscreen">

    <!-- Permiso para mostrar el botón flotante encima de cualquier otra aplicación -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Permiso para mantener el dispositivo encendido y que no se suspenda la reproducción -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Permiso para servicio en primer plano -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />

    <!-- Permiso para respuesta táctil háptica (vibración al desbloquear) -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Blackout Screen"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BlackoutScreen">

        <!-- Actividad Principal (Configuración y activación del botón) -->
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Actividad de Pantalla Negra (Inmersiva, oscura, brillo mínimo) -->
        <activity
            android:name=".BlackoutActivity"
            android:exported="false"
            android:theme="@style/Theme.BlackoutScreen.Fullscreen"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|keyboardHidden" />

        <!-- Servicio en primer plano para el botón flotante suspensivo -->
        <service
            android:name=".FloatingBlackoutService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

    </application>

</manifest>
`,
  },
  {
    name: 'activity_blackout.xml',
    path: 'app/src/main/res/layout/activity_blackout.xml',
    language: 'xml',
    description: 'Diseño XML para la pantalla oscura total con texto de aviso sutil.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/blackoutRoot"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000"
    android:keepScreenOn="true">

    <!-- Mensaje ultra tenue que solo aparece si el usuario toca la pantalla una sola vez -->
    <TextView
        android:id="@+id/tvHint"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="Toca 2 veces para reactivar la pantalla"
        android:textColor="#FFFFFF"
        android:textSize="14sp"
        android:alpha="0"
        android:visibility="gone" />

</FrameLayout>
`,
  },
  {
    name: 'layout_floating_bubble.xml',
    path: 'app/src/main/res/layout/layout_floating_bubble.xml',
    language: 'xml',
    description: 'Diseño XML de la burbuja flotante tipo botón suspensivo.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:padding="6dp">

    <!-- Fondo circular con sombra translúcida y borde brillante sutil -->
    <ImageView
        android:id="@+id/ivBubbleIcon"
        android:layout_width="56dp"
        android:layout_height="56dp"
        android:background="@drawable/bg_floating_bubble"
        android:contentDescription="Botón de Pantalla Negra"
        android:elevation="10dp"
        android:padding="14dp"
        android:src="@drawable/ic_moon_dark" />

</FrameLayout>
`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Configuración de Gradle con SDK 34 (Android 14) y dependencias modernas.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.app.blackoutscreen"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.app.blackoutscreen"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
}
`,
  },
  {
    name: 'build-apk.yml',
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    description: 'Workflow de GitHub Actions para compilar automáticamente el APK debug con JDK 21, Node 22, Capacitor y Gradle.',
    content: `name: Build Android APK

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'

      - name: Set up Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci || npm install

      - name: Build web application
        run: |
          npm run build

      - name: Setup & Sync Capacitor Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      - name: Accept Android SDK licenses
        run: |
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true

      - name: Build APK with Gradle
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 30
`,
  },
  {
    name: 'capacitor.config.json',
    path: 'capacitor.config.json',
    language: 'json',
    description: 'Configuración de Capacitor para empaquetar la app web como aplicación nativa de Android.',
    content: `{
  "appId": "com.blackoutscreen.app",
  "appName": "Blackout Screen",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "allowMixedContent": true
  }
}
`,
  },
];

