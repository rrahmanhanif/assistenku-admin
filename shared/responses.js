export function success(res, requestId, data) {
  return res.status(200).json({ success: true, data, request_id: requestId });
}

export function failure(res, requestId, message, status = 400) {
  return res.status(status).json({ success: false, error: message, request_id: requestId });
}
