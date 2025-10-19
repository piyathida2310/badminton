// คลาส Error แบบกำหนดสถานะ HTTP เองได้ ช่วยให้อ่านง่ายเวลาโยนจาก service
class HttpError extends Error {
  constructor(status, message, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = {
  HttpError,
};
