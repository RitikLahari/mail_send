import crypto from 'crypto';

/**
 * Playfair-style matrices (16x16) for 0-255 values.
 */
const matrix1 = Array.from({ length: 16 }, (_, i) =>
  Array.from({ length: 16 }, (_, j) => i * 16 + j)
);

const matrix2 = Array.from({ length: 16 }, (_, i) =>
  Array.from({ length: 16 }, (_, j) => 255 - (i * 16 + j))
);

/* -------- Playfair helper -------- */
function playfair(matrix, pixel1, pixel2) {
  const flat = matrix.flat();
  const pos1 = flat.indexOf(pixel1);
  const pos2 = flat.indexOf(pixel2);

  if (pos1 === -1 || pos2 === -1) return [pixel1, pixel2];

  const row1 = Math.floor(pos1 / 16),
    col1 = pos1 % 16;
  const row2 = Math.floor(pos2 / 16),
    col2 = pos2 % 16;

  let newRow1 = row1,
    newCol1 = col1,
    newRow2 = row2,
    newCol2 = col2;

  if (row1 === row2) {
    newCol1 = (col1 + 1) % 16;
    newCol2 = (col2 + 1) % 16;
  } else if (col1 === col2) {
    newRow1 = (row1 + 1) % 16;
    newRow2 = (row2 + 1) % 16;
  } else {
    newCol1 = col2;
    newCol2 = col1;
  }

  return [matrix[newRow1][newCol1], matrix[newRow2][newCol2]];
}

/* -------- Permutation (Fisher-Yates using crypto) -------- */
function permuteArray(byteArray) {
  const total = byteArray.length;
  const indices = Array.from({ length: total }, (_, i) => i);

  for (let i = total - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffled = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    shuffled[i] = byteArray[indices[i]];
  }

  return { shuffled, indices };
}

function unpermuteArray(shuffled, indices) {
  const original = new Uint8Array(shuffled.length);
  for (let i = 0; i < indices.length; i++) {
    original[indices[i]] = shuffled[i];
  }
  return original;
}

/* -------- Text encryption (Caesar/ROT13) -------- */
export async function encryptText(plainText) {
  const key = 13;
  return plainText
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + key) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + key) % 26) + 97);
      }
      return char;
    })
    .join('');
}

export async function decryptText(encryptedText) {
  const key = 13;
  return encryptedText
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - key + 26) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - key + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
}

/* -------- Image encryption without sharp --------
   Input: Buffer (image bytes)
   Output: Base64(JSON({ encrypted, indices }))
*/
export async function encryptImage(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const byteArray = Uint8Array.from(Buffer.from(base64Image));

    // Step 1: Permute
    const { shuffled, indices } = permuteArray(byteArray);

    // Step 2: Apply Playfair pairs
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const [n1, n2] = playfair(matrix1, shuffled[i], shuffled[i + 1]);
      shuffled[i] = n1;
      shuffled[i + 1] = n2;
    }
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const [n1, n2] = playfair(matrix2, shuffled[i], shuffled[i + 1]);
      shuffled[i] = n1;
      shuffled[i + 1] = n2;
    }

    const packageObj = {
      encrypted: Buffer.from(shuffled).toString('base64'),
      indices,
    };

    return Buffer.from(JSON.stringify(packageObj)).toString('base64');
  } catch (err) {
    console.error('Image encryption error:', err);
    return imageBuffer.toString('base64');
  }
}

/* -------- Image decryption -------- */
export async function decryptImage(packageBase64) {
  try {
    if (!packageBase64) return null;

    const decoded = Buffer.from(packageBase64, 'base64').toString();
    const obj = JSON.parse(decoded);

    if (!obj || !obj.encrypted) {
      return `data:image/png;base64,${packageBase64}`;
    }

    const encryptedBuffer = Buffer.from(obj.encrypted, 'base64');
    const indices = obj.indices;

    let processed = new Uint8Array(encryptedBuffer);

    // Reverse Playfair: just reuse logic (swap again)
    function playfairInverse(matrix, p1, p2) {
      const flat = matrix.flat();
      const pos1 = flat.indexOf(p1);
      const pos2 = flat.indexOf(p2);
      if (pos1 === -1 || pos2 === -1) return [p1, p2];

      const row1 = Math.floor(pos1 / 16),
        col1 = pos1 % 16;
      const row2 = Math.floor(pos2 / 16),
        col2 = pos2 % 16;

      let nRow1 = row1,
        nCol1 = col1,
        nRow2 = row2,
        nCol2 = col2;

      if (row1 === row2) {
        nCol1 = (col1 - 1 + 16) % 16;
        nCol2 = (col2 - 1 + 16) % 16;
      } else if (col1 === col2) {
        nRow1 = (row1 - 1 + 16) % 16;
        nRow2 = (row2 - 1 + 16) % 16;
      } else {
        nCol1 = col2;
        nCol2 = col1;
      }

      return [matrix[nRow1][nCol1], matrix[nRow2][nCol2]];
    }

    for (let i = 0; i < processed.length - 1; i += 2) {
      const [a1, a2] = playfairInverse(matrix2, processed[i], processed[i + 1]);
      processed[i] = a1;
      processed[i + 1] = a2;
    }
    for (let i = 0; i < processed.length - 1; i += 2) {
      const [a1, a2] = playfairInverse(matrix1, processed[i], processed[i + 1]);
      processed[i] = a1;
      processed[i + 1] = a2;
    }

    const originalRaw = unpermuteArray(processed, indices);

    const originalBase64 = Buffer.from(originalRaw).toString();
    return `data:image/png;base64,${originalBase64}`;
  } catch (err) {
    console.error('Image decryption error:', err);
    return null;
  }
}
