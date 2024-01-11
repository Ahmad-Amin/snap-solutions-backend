const binaryToDataURI = (binaryData) => {
  if (!binaryData) {
    return null;
  }

  const base64Image = Buffer.from(binaryData.buffer).toString("base64");
  return `data:image/jpeg;base64,${base64Image}`;
};

const dataURIToBinary = (dataURI) => {
  if (!dataURI) {
    return null;
  }

  const base64String = dataURI.split(",")[1];
  const binaryData = Buffer.from(base64String, "base64");

  return binaryData;
};

module.exports = { binaryToDataURI, dataURIToBinary };
