import readline from "readline";
import { ethers } from "ethers";
import fetch from "node-fetch";
import cfonts from 'cfonts';

// Function to generate a random Ethereum address and private key
function generateRandomAddress() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Function to fetch nonce from API
async function getNonce(walletAddress) {
  const url = "https://lightmining-api.taker.xyz/wallet/generateNonce";
  const payload = { walletAddress };

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.data.nonce;
  } catch (error) {
    throw new Error(`Error fetching nonce: ${error.message}`);
  }
}

// Function to generate signature
async function generateSignature(privateKey, message) {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  } catch (error) {
    console.error("Error signing message:", error.message);
  }
}

// Function to log in using the API
async function login(address, signature, nonce, invitationCode) {
  const url = "https://lightmining-api.taker.xyz/wallet/login";

  const payload = {
    address,
    signature,
    message: `Lite Mining needs to verify your identity to prevent unauthorized access. Please confirm your sign-in details below:\n\naddress: ${address}\n\nNonce: ${nonce}`,
    invitationCode,
  };

  const headers = {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error during login:", error.message);
  }
}

// Function to handle interactive input
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

// Main function
(async () => {
    cfonts.say('NT Exhaust', {
      font: 'block',        // Options: 'block', 'simple', '3d', etc.
      align: 'center',
      colors: ['cyan', 'magenta'],
      background: 'black',
      letterSpacing: 1,
      lineHeight: 1,
      space: true,
      maxLength: '0',
    });
  console.log("=== Telegram Channel : NT Exhaust ( @NTExhaust ) ===")
  console.log("\n=== Taker Lite Mining Bot ===\n");

  const invitationCode = await askQuestion("Enter your referral code: ");
  const loopCount = await askQuestion("Enter the number of iterations: ");

  const loops = parseInt(loopCount, 10);

  if (isNaN(loops) || loops <= 0) {
    console.error("\nError: Number of iterations must be a positive number.\n");
    process.exit(1);
  }

  console.log("\n=== Start of Process ===\n");
  console.log(`Referral Code: ${invitationCode}`);
  console.log(`Number of Iterations: ${loops}\n`);

  for (let i = 0; i < loops; i++) {
    console.log(`\n--- Iteration ${i + 1} ---\n`);

    const randomAddress = generateRandomAddress();
    console.log(`Generated Ethereum Wallet:`);
    console.log(`Address: \x1b[32m${randomAddress.address}\x1b[0m`);
    console.log(`Private Key: \x1b[31m${randomAddress.privateKey}\x1b[0m`);

    try {
      const nonceMessage = await getNonce(randomAddress.address);
      const formattedNonce = nonceMessage.replace(/\n/g, "\\n");
      const nonceMatch = formattedNonce.match(/Nonce:\s*([a-f0-9-]+)/i);
      const nonce = nonceMatch ? nonceMatch[1] : null;
      console.log(`Nonce Retrieved: \x1b[33m${nonce}\x1b[0m`);

      const signature = await generateSignature(randomAddress.privateKey, nonceMessage);
      console.log(`Signature: \x1b[36m${signature}\x1b[0m`);

      const loginResponse = await login(randomAddress.address, signature, nonce, invitationCode);
      console.log(`Login Response:`, loginResponse);

      if (loginResponse?.msg === "SUCCESS") {
        console.log(`\x1b[32m✔ Login Successful for ${randomAddress.address}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ Login Failed for ${randomAddress.address}\x1b[0m`);
      }
    } catch (error) {
      console.error(`\x1b[31m✖ Error during Iteration ${i + 1}: ${error.message}\x1b[0m`);
    }
  }

  console.log("\n=== End of Process ===\n");
})();