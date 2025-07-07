
export default function handler(req, res) {
  res.status(200).json({
    owner_wa: process.env.OWNER_WHATSAPP,
    channel_wa: process.env.CHANNEL_WHATSAPP
  });
}
