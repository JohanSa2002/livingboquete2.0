<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'Login · MIKA Homes Admin',
  htmlAttrs: { lang: 'es' },
  bodyAttrs: { class: 'admin-login-body' },
  link: [{
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap',
  }],
})

const password = ref('')
const failed = ref(false)
const errorMsg = ref('Contrasena incorrecta')

async function submit() {
  failed.value = false
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    window.location.href = '/admin'
  }
  catch (err: any) {
    errorMsg.value = err?.statusCode === 429
      ? 'Demasiados intentos. Prueba de nuevo en unos minutos.'
      : 'Contrasena incorrecta'
    failed.value = true
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="logo">
        <div class="logo-icon">B</div>
        <span class="logo-text">Boquete</span>
      </div>
      <p class="login-subtitle">Panel de administracion</p>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label for="password">Contrasena</label>
          <input
            id="password"
            v-model="password"
            type="password"
            name="password"
            placeholder="Ingresa tu contrasena"
            autofocus
            required
          >
        </div>
        <button type="submit" class="submit-btn">Ingresar</button>
        <p v-show="failed" class="error">{{ errorMsg }}</p>
      </form>
    </div>
    <div class="login-footer">
      <a href="/">Volver al sitio</a>
    </div>
  </div>
</template>

<style>
body.admin-login-body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: #111110;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow: hidden;
}

/* Subtle background gradient */
body.admin-login-body::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,150,74,.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(185,92,54,.04) 0%, transparent 50%);
  pointer-events: none;
}
</style>

<style scoped>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 44px 40px 40px;
  box-shadow:
    0 0 0 1px rgba(0,0,0,.04),
    0 24px 68px rgba(0,0,0,.12),
    0 8px 20px rgba(0,0,0,.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: center;
}
.logo-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #C8964A 0%, #8E4A2A 100%);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; color: #fff;
  box-shadow: 0 2px 8px rgba(200,150,74,.3);
}
.logo-text {
  font-weight: 800; font-size: 22px;
  color: #1a1918; letter-spacing: -.03em;
}

.login-subtitle {
  font-size: 14px; font-weight: 500;
  color: #8c8c87;
  text-align: center;
  margin-bottom: 32px;
}

.form-group { margin-bottom: 4px; }

label {
  display: block;
  font-size: 13px; font-weight: 600;
  color: #3d3d39;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dddcdb;
  border-radius: 11px;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  color: #1a1918;
  background: #fafaf9;
  transition: all .15s ease;
}
input::placeholder { color: #b5b5b0; }
input:focus {
  border-color: #C8964A;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(200,150,74,.12);
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 13px 20px;
  background: #1a1918;
  color: #fafaf9;
  font-weight: 700;
  font-size: 14px;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,.1);
  letter-spacing: -.01em;
}
.submit-btn:hover { background: #2c2c28; }
.submit-btn:active { transform: scale(.99); }

.error {
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  margin-top: 16px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 9px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #4a4a45;
}
.login-footer a {
  color: #6e6e69;
  text-decoration: none;
  transition: color .12s;
}
.login-footer a:hover { color: #C8964A; }
</style>
