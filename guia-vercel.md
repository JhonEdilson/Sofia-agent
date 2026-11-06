# Guía: Sofia agent en línea con Vercel

**Estado al 2026-10-04: desplegado.** Producción: **https://sofia-agent-pi.vercel.app**

Esta guía recoge lo que ya está hecho, cómo se hizo (por si hay que repetirlo), el paso crítico que sigue pendiente y los pendientes del proyecto.

---

## 1. El código en GitHub (hecho)

Repositorio: https://github.com/JhonEdilson/Sofia-agent (público, rama `main`). GitHub no admite espacios en el nombre, por eso "Sofia agent" quedó como `Sofia-agent`.

Para subir cambios, en PowerShell dentro del proyecto:

```powershell
cd C:\Dev\Jarvis\demo-voz-clinica
git add -A
git commit -m "Describe el cambio"
git push
```

---

## 2. Vercel (hecho con la CLI)

- **Proyecto:** `sofia-agent`, en el equipo `jhonedilsons-projects` (plan Hobby).
- **Dominio de producción:** `https://sofia-agent-pi.vercel.app`. El nombre `sofia-agent.vercel.app` ya lo tenía otro proyecto, por eso Vercel agregó `-pi`.
- **GitHub conectado:** cada `git push` a `main` despliega solo.
- **Variables de entorno (10):**
  - Secretas, tipo Sensitive (Vercel no vuelve a mostrar el valor), en Production y Preview: `ELEVENLABS_API_KEY`, `GOOGLE_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GOOGLE_CALENDAR_REFRESH_TOKEN`, `AVISAR_SECRET`.
  - Normales, en Production, Preview y Development: `AGENT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CALENDAR_ID`, `AVISO_TO`, `JHON_WHATSAPP`.
- **Protección:** el dominio de producción es **público** (comprobado sin iniciar sesión). Las URLs de cada despliegue individual (`sofia-agent-xxxx-jhonedilsons-projects.vercel.app`) sí piden login de Vercel. Es lo normal.

**Cómo repetirlo desde cero** (PowerShell, dentro del proyecto):

```powershell
npx vercel login
npx vercel link --yes --project sofia-agent --scope jhonedilsons-projects
npx vercel env add NOMBRE production --sensitive    # una por variable y entorno; el valor se pega o entra por stdin
npx vercel deploy --prod --scope jhonedilsons-projects
```

Tres tropiezos conocidos:

1. `vercel link` agrega `VERCEL_OIDC_TOKEN` a tu `.env.local` (inofensivo, no se sube) y **anexa líneas repetidas al `.gitignore`**. La línea `.env*` anexada queda después de `!.env.example` y volvería a ignorar la plantilla. Restaura el archivo: `git checkout -- .gitignore`.
2. `vercel deploy` sube tus archivos locales, no solo lo que está en git. Antes de desplegar por CLI, aparta o borra `public/img/tratamiento-carillas-2.jpg` si no quieres que quede servida.
3. Si `vercel deploy` falla con "An unexpected internal error occurred" después de subir, es pasajero: repite el comando.

---

## 3. Verificado el 2026-10-04

En producción, sin iniciar sesión:

- La página carga completa, con título correcto y sin muro de login.
- `/api/token` responde 200 con token.
- `/api/disponibilidad` devuelve 22 franjas reales: las variables y la conexión con Google funcionan en Vercel.
- Reserva real: se crea, la franja desaparece, otra persona en la misma hora recibe 409, el reintento del mismo paciente no duplica. El evento de prueba se borró.
- `/api/avisar-humano` sin secreto responde 401 `no_autorizado` (es nuestra ruta).
- Las 5 imágenes cargan, sin errores de consola, y el menú móvil abre.

**Te toca a ti:**

1. Abrir https://sofia-agent-pi.vercel.app en tu celular: menú, slider de tratamientos y formulario.
2. Pegar el link en un chat de WhatsApp y ver la vista previa (hoy saldrá sin imagen: ver pendientes).
3. Probar a Sofía cuando haya créditos (paso 4, punto 8).

---

## 4. Pendiente crítico: conectar a Sofía con el dominio nuevo

La tool `avisar_humano` sigue apuntando a `https://demo-voz-clinica.vercel.app/api/avisar-humano`, un dominio que **nadie tiene**. Cualquiera podría registrarlo en Vercel y recibir los avisos (nombre, contacto y resumen de un paciente) y el secreto. Cámbialo:

1. Genera un secreto nuevo. En PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

2. En ElevenLabs: Agents, Demo-clinica, Tools, `avisar_humano`.
3. URL: `https://sofia-agent-pi.vercel.app/api/avisar-humano`.
4. Header `x-avisar-secret`: pega el secreto nuevo. Guarda.
5. Actualiza `AVISAR_SECRET` en Vercel (Settings, Environment Variables, en Production y Preview) y en tu `.env.local`.
6. Redespliega: `npx vercel deploy --prod --scope jhonedilsons-projects`, o en Vercel, Deployments, menú `...`, **Redeploy**.
7. Comprueba que el 401 sigue siendo de nuestra ruta: abre una ventana de PowerShell y corre `Invoke-WebRequest -Method POST https://sofia-agent-pi.vercel.app/api/avisar-humano -Body "{}"`. Debe fallar con 401.
8. Con créditos, dile a Sofía "quiero cancelar mi cita". Debe llegar un correo a `AVISO_TO` y aparecer la tarjeta 2 en "Lo que acaba de pasar por dentro".

Claude puede hacer los pasos 2 a 6 por API si se lo pides.

---

## 5. Actualizar después

- Cada `git push` a `main` redespliega solo.
- Si solo cambias una variable de entorno, hay que **redesplegar** para que aplique. `JHON_WHATSAPP` se lee al construir la página.

---

## 6. Si algo falla

- **El build falla:** Vercel, Deployments, el despliegue fallido, Build Logs. Corre `npm run build` en tu computador para ver el mismo error.
- **"No pudimos cargar la agenda":** falta o está mal alguna variable de Google, o el token venció (`invalid_grant`). Mira Vercel, Logs.
- **"Sofía no pudo atenderle esta vez":** casi seguro créditos de ElevenLabs agotados.
- **El botón de WhatsApp no aparece:** falta `JHON_WHATSAPP`, o la cambiaste y no redesplegaste.
- **No llega el correo de recepción:** el secreto del header debe coincidir con `AVISAR_SECRET` y la URL de la tool debe usar el dominio real.

---

## 7. Pendientes

**Antes de compartir el link**

- Paso 4 de esta guía (URL y secreto de `avisar_humano`).
- Créditos de ElevenLabs agotados (`quota_exceeded`, 2026-10-04): recargar o esperar la renovación. Mientras tanto Sofía muestra el mensaje y el formulario sigue funcionando.
- Conversación real por voz con Sofía, agendando y cancelando: nunca se probó de punta a punta. Las tarjetas de "por dentro" con Sofía dependen del formato de respuesta de `create_event`, que no está verificado.
- Token de Google: confirmar **después del 11 de octubre** que sigue vivo. Si da `invalid_grant`, el proyecto de Google Cloud sigue en "Testing": pasarlo a "In production" y emitir otro.
- Dirección ficticia ("Carrera 48 # 10-45"): buscarla en Google Maps. Si coincide con una clínica real, cambiarla en `app/horario.tsx` y en la KB de Sofía, las dos a la vez.
- `README.md` es el de create-next-app: reemplazarlo.

**Decisiones tuyas**

- Dominio: `sofia-agent-pi.vercel.app` es el que Vercel dio. Si quieres otro, en Vercel, Settings, Domains, agrega un `<nombre>.vercel.app` libre. Entonces hay que repetir el paso 4 con el dominio nuevo.
- Foto de carillas: hoy es la de producto (`tratamiento-carillas-3.png`). Si la cambias por una sonrisa, es un solo `src` en `app/tratamientos.tsx`.
- `public/img/tratamiento-carillas-2.jpg` (el macro descartado) sigue en tu carpeta, sin uso y **fuera del commit**: bórrala o ignórala.
- `guia-vercel.md` está sin commitear. Si la subes al repo público, queda visible esta lista de pendientes.
- Texto del mensaje de WhatsApp: es provisional (`app/page.tsx`).
- Modo oscuro: no se decidió; hoy la página es solo clara.

**Mejoras**

- Imagen de vista previa del enlace (`og:image`, `og:title`): ahora que hay dominio, falta poner `metadataBase` con `https://sofia-agent-pi.vercel.app` y la imagen. Hoy el título es el genérico de `app/layout.tsx`.
- KB de Sofía: agregar "ortodoncia invisible" y alineadores (solo dice brackets), reposicionarla a estética y volver a subirla. El prompt publicado es anterior a los últimos cambios: volver a pegarlo.
- `/api/token` y `/api/agendar` son públicos y sin límite por IP. Si el link circula mucho: activar `enable_auth` en el agente o agregar un límite.
- Festivos de `lib/slots.ts`: la lista termina el 2027-01-11. Extenderla antes de esa fecha.
- Pruebas en Safari, Firefox y un celular físico: solo se probó en Chromium.
- `DESIGN.md` (`/impeccable document`) sin generar.
- Los nombres y teléfonos que dejen los visitantes quedan en el calendario: borrar los eventos de prueba de vez en cuando.
- `public/` conserva los SVG de ejemplo de create-next-app (`file`, `globe`, `next`, `vercel`, `window`), sin uso.
