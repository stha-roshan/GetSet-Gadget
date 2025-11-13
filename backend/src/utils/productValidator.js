export const REGEX = {
  name: /^[A-Za-z0-9\s'’"(),.-]{2,100}$/,
  description: /^[A-Za-z0-9\s.,'"!?:;()%&/\-+]{10,500}$/,
  brand: /^[A-Za-z0-9\s&'.\-]{2,50}$/,
};

export const isValidProductName = (name) => {
  if (!name || typeof name !== "string") return false;
  return REGEX.name.test(name.trim());
};

export const isValidDescription = (description) => {
  if (!description || typeof description !== "string") return false;
  return REGEX.description.test(description.trim());
};

export const isValidBrand = (brand) => {
  if (!brand || typeof brand !== "string") return false;
  return REGEX.brand.test(brand.trim());
};

export const isValidPrice = (price) => {
  const num = Number(price);
  if (isNaN(num) || num <= 0 || num > 1000000) return false;

  const decimalPart = num.toString().split(".")[1];
  if (decimalPart && decimalPart.length > 2) return false;

  return true;
};

export const isValidStock = (stock) => {
  const num = Number(stock);
  if (isNaN(num) || num < 0 || num > 1000000 || !Number.isInteger(num))
    return false;
  return true;
};

export const isValidTotalSales = (totalSales) => {
  const num = Number(totalSales);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) return false;
  return true;
};

export const isValidImage = (image) => {
  if (!image || typeof image !== "string") return false;
  const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return urlRegex.test(image.trim()) || base64Regex.test(image);
};

export const isValidCategory = (category) => {
  if (!category || typeof category !== "string") return false;
  return true;
};

export const buildProductValidation = (data) => {
  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    image,
    totalSales,
  } = data;

  const validation = [
    {
      value: name,
      field: "name",
      validator: isValidProductName,
      message:
        "Invalid product name: only letters, numbers, spaces, and basic punctuation are allowed.",
    },

    {
      value: description,
      field: "description",
      validator: isValidDescription,
      message:
        "Invalid product description: must be 10–500 characters and can include letters, numbers, and basic punctuation.",
    },

    {
      value: category,
      field: "category",
      validator: isValidCategory,
      message: "Invalid category",
    },

    {
      value: brand,
      field: "brand",
      validator: isValidBrand,
      message: "Invalid brand name",
    },

    {
      value: price,
      field: "price",
      validator: isValidPrice,
      message: "Invalid price",
    },

    {
      value: stock,
      field: "stock",
      validator: isValidStock,
      message: "Invalid stock",
    },

    {
      value: image,
      field: "image",
      validator: isValidImage,
      message: "Invalid image format",
    },
  ];

  if (totalSales) {
    validation.push({
      value: totalSales,
      field: "totalSales",
      validator: isValidTotalSales,
      message: "Invalid total sales",
    });
  }

  return validation
};
