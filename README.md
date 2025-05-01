# 🚀 hono-cors-anywhere

A blazing-fast [Hono](https://honojs.dev/) ⚡️ middleware/service that proxies HTTP requests and adds CORS headers — a modern, Cloudflare Workers-native alternative to "CORS Anywhere". Perfect for developers needing seamless cross-origin requests! 🌍

---

## ✨ Features

- 🛡️ **Bypass CORS Restrictions:** Proxy any HTTP(S) request with ease.
- 🎛️ **Configurable CORS Headers:** Tweak to fit any use case.
- ⚡ **Ultra-lightweight:** Built for speed and minimal cold starts on Cloudflare Workers.
- 🔗 **Hono-powered:** Utilizes the awesome [Hono](https://honojs.dev/) framework.

---

## 🚦 Quick Start

### 1. 🚀 Deploy with [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

```sh
wrangler deploy
```

### 2. 🧑‍💻 Develop Locally

```sh
wrangler dev
```

### 3. 🌐 Proxy Requests Instantly

Just send a request with your target URL as a query parameter:

```
https://your-worker.example.workers.dev/?url=https://api.example.com/data
```

The Worker fetches the remote resource and responds with CORS headers set for you.

---

## 🛠️ Configuration

- 🔒 Want to restrict origins? Edit the source to specify allowed origins or fine-tune CORS headers.
- 🌐 By default: `Access-Control-Allow-Origin: *` (permits all origins).

---

## 📦 Example Usage

```sh
curl "https://your-worker.example.workers.dev/?url=https://jsonplaceholder.typicode.com/posts/1"
```

---

## ❤️ Contributing

PRs and issues welcome! Open source, friendly to contributors. See [CONTRIBUTING.md](CONTRIBUTING.md) if available.

---

## 📄 License

[MIT](https://opensource.org/licenses/MIT) &copy; Cloudflare/Hono Community

---
