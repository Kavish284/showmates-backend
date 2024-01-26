const CryptoJS = require('crypto-js');
const AES = require('crypto-js/aes');
const Utf8 = require('crypto-js/enc-utf8');


const encryptionKey = "sQ@tE#3m@s7"; 

exports.decryptData = (encryptedData) => {
  try{ 
    console.log(encryptedData);
  const decryptedValue = AES.decrypt(encryptedData, encryptionKey).toString(Utf8);
  console.log(decryptedValue);
  return JSON.parse(decryptedValue);
  }catch(error){
    console.log(error);
  }
}

exports.encryptData = (data) => {

  const encryptedValue = AES.encrypt(JSON.stringify(data), encryptionKey).toString();
  return encryptedValue;
}


exports.isDataEncrypted=(data) =>{
  try {
    const decryptedValue = AES.decrypt(encryptedData, encryptionKey).toString(Utf8);
    console.log(decryptedValue);
    return decryptedValue != "";
  } catch (error) {
    return false;
  }
}