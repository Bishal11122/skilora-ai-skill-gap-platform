/**
 * Controller to handle the health check endpoint.
 * Returns standard service health status and current ISO timestamp.
 */
export function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'skill-gap-platform-api',
    time: new Date().toISOString(),
  });
}

export default {
  getHealth,
};
