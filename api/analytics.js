export default function handler(req, res) {
  res.status(200).json({
    totalInteractions: 42,
    uniqueUsers: 15,
    questionsCount: 8
  });
}
