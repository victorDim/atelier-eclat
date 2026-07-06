const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || process.argv[2] || 3000);
const root = __dirname;
const dataFile = path.join(root, 'data.json');

function loadStore() {
  if (!fs.existsSync(dataFile)) {
    const initialStore = { orders: [], inquiries: [], notifications: [] };
    fs.writeFileSync(dataFile, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }

  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    return { orders: [], inquiries: [] };
  }
}

const store = loadStore();
if (!Array.isArray(store.orders)) store.orders = [];
if (!Array.isArray(store.inquiries)) store.inquiries = [];
if (!Array.isArray(store.notifications)) store.notifications = [];

function saveStore() {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

async function sendEmailNotification(notification) {
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log(`[email-hook:${notification.type}] ${notification.subject || 'Notification queued'}`);
    return false;
  }

  return await new Promise((resolve) => {
    const parsedUrl = new URL(webhookUrl);
    const req = https.request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });

    req.on('error', () => resolve(false));
    req.write(JSON.stringify(notification));
    req.end();
  });
}

async function sendNotification(type, payload) {
  const notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    ...payload,
    createdAt: new Date().toISOString()
  };
  store.notifications.push(notification);
  saveStore();
  await sendEmailNotification(notification);
  return notification;
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function serveFile(res, filePath) {
  const extension = path.extname(filePath);
  const contentType = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  }[extension] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/contact') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const inquiry = { ...payload, receivedAt: new Date().toISOString() };
        store.inquiries.push(inquiry);
        saveStore();
        sendNotification('inquiry', {
          subject: 'New inquiry',
          recipient: payload.email,
          message: `Inquiry received from ${payload.name}`
        });
        sendJson(res, 200, { message: 'Your inquiry has been received by our concierge team.' });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid contact payload.' });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/orders') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const order = { ...payload, receivedAt: new Date().toISOString() };
        store.orders.push(order);
        saveStore();
        sendNotification('reservation', {
          subject: 'New reservation',
          recipient: payload.customer?.email,
          message: `Reservation received for ${payload.items?.length || 0} item(s)`
        });
        sendJson(res, 200, { message: 'Reservation confirmed. Our team will follow up shortly.' });
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid order payload.' });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/payments/intent') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const provider = process.env.PAYMENT_PROVIDER || 'mock';
        const response = {
          provider,
          status: 'requires_confirmation',
          clientSecret: `mock-${Date.now()}`,
          providerReference: `${provider}-${Date.now()}`,
          message: provider === 'mock' ? 'Payment provider is ready for confirmation.' : 'Payment provider integration is configured.'
        };
        sendJson(res, 200, response);
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid payment payload.' });
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/orders') {
    sendJson(res, 200, { orders: store.orders, inquiries: store.inquiries });
    return;
  }

  if (req.method === 'GET' && req.url === '/api/dashboard') {
    sendJson(res, 200, {
      summary: {
        orders: store.orders.length,
        inquiries: store.inquiries.length,
        notifications: store.notifications.length
      },
      orders: store.orders.slice(-5).reverse(),
      inquiries: store.inquiries.slice(-5).reverse(),
      notifications: store.notifications.slice(-5).reverse()
    });
    return;
  }

  let requestedPath = req.url.split('?')[0];
  if (requestedPath === '/') requestedPath = '/index.html';
  const filePath = path.join(root, requestedPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(res, filePath);
});

server.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
