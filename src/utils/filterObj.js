module.exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  for (const key in obj) {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  }

  return newObj;
};
