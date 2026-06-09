const qrcode = require('qrcode');
qrcode.toFile('C:\\Users\\PK Rajbangshi\\.gemini\\antigravity\\brain\\27604146-58c9-4d34-8e2f-748409036aa3\\expo-qr-latest.png', 'exp://192.168.1.94:8081', function (err) {
  if (err) throw err;
  console.log('done');
});
