const inputDateString = "2024-01-17T00:00:00.000Z";

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const formateDateToLocaleDateString = (inputDateString) => {
  const inputDate = new Date(inputDateString);
  return inputDate.toLocaleDateString("en-US", options);
};
module.exports = { formateDateToLocaleDateString };
