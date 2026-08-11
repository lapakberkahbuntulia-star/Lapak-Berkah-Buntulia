const PRINTER_NAME = 'RPP02N';
const SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

function bytesToUint8Array(bytes) {
  if (typeof bytes === 'string') {
    const encoder = new TextEncoder();
    const lineBytes = encoder.encode(bytes);
    const result = new Uint8Array(lineBytes.length + 1);
    result.set(lineBytes);
    result[lineBytes.length] = LF;
    return result;
  }
  return new Uint8Array(bytes);
}

export function buildReceiptPayload(transaction) {
  const total = transaction.items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
  const now = new Date().toLocaleString('id-ID');
  const payload = [];

  payload.push([ESC, 0x40]);
  payload.push([ESC, 0x61, 0x01]);
  payload.push('Lapak Berkah Buntulia');
  payload.push('Struk Pembelian');
  payload.push(`No. Transaksi: #${transaction.id.toString().slice(-2)}`);
  payload.push(`Tanggal: ${transaction.completedAt || now}`);
  payload.push(`Metode: ${transaction.paymentMethod || 'Tunai'}`);
  payload.push('--------------------');

  for (const item of transaction.items) {
    const itemTotal = item.sellingPrice * item.qty;
    payload.push(item.name);
    payload.push(`${item.qty} x ${item.sellingPrice.toLocaleString('id-ID')}`);
    payload.push(`Rp ${itemTotal.toLocaleString('id-ID')}`);
    payload.push('--------------------');
  }

  payload.push(`Total Rp ${total.toLocaleString('id-ID')}`);

  if (transaction.paid > 0) {
    payload.push(`Bayar Rp ${transaction.paid.toLocaleString('id-ID')}`);
    payload.push(`Kembali Rp ${transaction.change.toLocaleString('id-ID')}`);
  }

  payload.push('Terima kasih');
  payload.push([LF]);
  payload.push([LF]);
  payload.push([ESC, 0x64, 0x03]);
  payload.push([GS, 0x56, 0x00]);

  const bytes = [];
  for (const line of payload) {
    bytes.push(...bytesToUint8Array(line));
  }

  return bytesToUint8Array(bytes);
}

export function buildReturnReceiptPayload(transaction, returnReason) {
  const payload = [];

  payload.push([ESC, 0x40]);
  payload.push([ESC, 0x61, 0x01]);
  payload.push('Struk Retur');
  payload.push([ESC, 0x61, 0x00]);
  payload.push(`No. Transaksi: #${transaction.transactionId}`);
  payload.push(`Tanggal: ${transaction.date}`);
  payload.push(`Mitra: ${transaction.mitraName}`);
  payload.push(`Metode: ${transaction.paymentMethod}`);
  payload.push('--------------------');

  for (const item of transaction.rawItems || []) {
    payload.push(item.product?.nama_produk || 'Produk');
    payload.push(`Qty: ${item.quantity}`);
    payload.push('--------------------');
  }

  payload.push(`Total Retur: ${transaction.total.toLocaleString('id-ID')}`);

  if (returnReason) {
    payload.push(`Alasan: ${returnReason}`);
  }

  payload.push('Terima kasih');
  payload.push([LF]);
  payload.push([LF]);
  payload.push([ESC, 0x64, 0x03]);
  payload.push([GS, 0x56, 0x00]);

  const bytes = [];
  for (const line of payload) {
    bytes.push(...bytesToUint8Array(line));
  }

  return bytesToUint8Array(bytes);
}

let cachedDevice = null;
let cachedCharacteristic = null;

export function clearPrinterCache() {
  cachedDevice = null;
  cachedCharacteristic = null;
}

export async function connectPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth tidak didukung di browser ini.');
  }

  if (cachedCharacteristic) {
    try {
      await cachedCharacteristic.writeValue(new Uint8Array([]));
      return { device: cachedDevice, characteristic: cachedCharacteristic };
    } catch {
      cachedDevice = null;
      cachedCharacteristic = null;
    }
  }

  console.log('Requesting Bluetooth device:', PRINTER_NAME);
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: PRINTER_NAME }],
    optionalServices: [SERVICE_UUID],
  });
  console.log('Device selected:', device.name);

  const server = await device.gatt.connect();
  console.log('GATT connected');
  const service = await server.getPrimaryService(SERVICE_UUID);
  console.log('Service found');
  const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
  console.log('Characteristic found');

  cachedDevice = device;
  cachedCharacteristic = characteristic;

  return { device, characteristic };
}

export async function printReceiptBluetooth(transaction) {
  const payload = buildReceiptPayload(transaction);

  try {
    console.log('Attempting Bluetooth print...');
    const { characteristic } = await connectPrinter();
    console.log('Writing payload:', payload.length, 'bytes');
    await characteristic.writeValue(payload);
    console.log('Print success');
    return { success: true, method: 'bluetooth' };
  } catch (error) {
    console.error('Bluetooth print failed:', error);
    cachedDevice = null;
    cachedCharacteristic = null;
    return { success: false, method: 'bluetooth', error: error.message };
  }
}

export async function printReturnReceiptBluetooth(transaction, returnReason) {
  const payload = buildReturnReceiptPayload(transaction, returnReason);

  try {
    const { characteristic } = await connectPrinter();
    await characteristic.writeValue(payload);
    return { success: true, method: 'bluetooth' };
  } catch (error) {
    console.error('Bluetooth return print failed:', error);
    cachedDevice = null;
    cachedCharacteristic = null;
    return { success: false, method: 'bluetooth', error: error.message };
  }
}

export async function printReceipt(transaction) {
  const bluetoothResult = await printReceiptBluetooth(transaction);
  if (bluetoothResult.success) {
    return bluetoothResult;
  }

  return printReceiptFallback(transaction);
}

export function printReceiptFallback(transaction) {
  try {
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) {
      return { success: false, method: 'fallback', error: 'Pop-up diblokir' };
    }

    const total = transaction.items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
    const now = new Date().toLocaleString('id-ID');

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk #${transaction.id.toString().slice(-2)}</title>
          <style>
            @page { size: 58mm auto; margin: 2mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 2mm;
              font-family: Arial, sans-serif;
              font-size: 11px;
              color: #000;
              background: #fff;
              width: 58mm;
            }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 1px; font-size: 11px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="font-bold" style="font-size: 13px;">Lapak Berkah Buntulia</div>
            <div style="font-size: 10px; color: #666;">Struk Pembelian</div>
          </div>
          <div style="margin-top: 4px;">
            <div>No. Transaksi: #${transaction.id.toString().slice(-2)}</div>
            <div>Tanggal: ${transaction.completedAt || now}</div>
            <div>Metode: ${transaction.paymentMethod || 'Tunai'}</div>
          </div>
          <table style="margin-top: 6px;">
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px dashed #ccc;">Item</th>
                <th style="text-align: center; border-bottom: 1px dashed #ccc;">Qty</th>
                <th style="text-align: right; border-bottom: 1px dashed #ccc;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td style="padding: 2px 0; font-size: 10px;">${item.name}</td>
                  <td style="text-align: center; padding: 2px 0; font-size: 10px;">${item.qty} x ${item.sellingPrice.toLocaleString('id-ID')}</td>
                  <td style="text-align: right; padding: 2px 0; font-size: 10px;">Rp ${(item.sellingPrice * item.qty).toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 6px; border-top: 1px dashed #ccc; padding-top: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>Total</span>
              <span>Rp ${total.toLocaleString('id-ID')}</span>
            </div>
            ${transaction.paid > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
                <span>Bayar</span>
                <span>Rp ${transaction.paid.toLocaleString('id-ID')}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
                <span>Kembali</span>
                <span>Rp ${transaction.change.toLocaleString('id-ID')}</span>
              </div>
            ` : ''}
          </div>
          <div class="text-center" style="margin-top: 8px; font-size: 10px; color: #666;">
            Terima kasih telah berbelanja
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };

    return { success: true, method: 'fallback' };
  } catch (error) {
    return { success: false, method: 'fallback', error: error.message };
  }
}
