import Certification from "../models/Certification.mjs";

export const getCertificates = async () => {
  const certs = await Certification.find().sort({ order: 1 }).lean();
  return certs.map((c) => ({
    _id: c._id,
    title: c.title,
    issuer: c.issuer,
    platform: c.platform,
    year: c.year,
    logo: c.logo,
    certificateUrl: c.certificateUrl,
    credentialId: c.credentialId,
  }));
};
