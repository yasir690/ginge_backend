const verifyOTP = (requestOTP, otp, updatedAt) => {
  const now = new Date();
  const created_at = new Date(updatedAt);
  const timeDiffSeconds = Math.floor((now - created_at) / 1000);
  console.log(timeDiffSeconds, "timeDiffSeconds");
  return requestOTP == otp && timeDiffSeconds <= 70;
};

module.exports = verifyOTP;
