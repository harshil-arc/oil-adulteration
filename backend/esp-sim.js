const express = require('express');
const cors = require('cors'); // <--- PROPER CORS MIDDLEWARE

const app = express();
const PORT = 3000;

// Enable CORS for all routes and origins
app.use(cors());

// Or manually if you prefer not to use the 'cors' package, but the package is best!
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

const OIL_TYPES = ['Mustard Oil', 'Sunflower Oil', 'Coconut Oil', 'Olive Oil', 'Palm Oil'];

app.get('/data', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /data from ${req.ip}`);

  res.json({
    temperature:        parseFloat((Math.random() * 10 + 25).toFixed(2)),   // 25–35 °C
    wavelength:         Math.floor(Math.random() * 50 + 430),               // 430–480 nm
    density:            parseFloat((Math.random() * 0.08 + 0.88).toFixed(4)), // 0.88–0.96 g/cm³
    oil_type:           OIL_TYPES[Math.floor(Math.random() * OIL_TYPES.length)],
    adulteration_index: parseFloat((Math.random()).toFixed(2)),              // 0.00–1.00
  });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`ESP Simulator running at http://localhost:${PORT}`);
  console.log(`CORS is fully enabled.`);
});
