// Compare release content without disabling Cloudflare's email-harvesting protection.
// Only its documented email rewrite is reversible here; every other byte is retained.
const decodeEmail = (hex) => {
  if (!/^(?:[a-f0-9]{2}){2,}$/i.test(hex)) return null;
  const bytes = Buffer.from(hex, "hex");
  const email = [...bytes.subarray(1)].map((byte) => String.fromCharCode(byte ^ bytes[0])).join("");
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+$/.test(email) ? email : null;
};

export const normalizeCloudflareEmailObfuscation = (html) => String(html)
  .replace(/href="\/cdn-cgi\/l\/email-protection#([a-f0-9]+)"/gi, (original, hex) => {
    const email = decodeEmail(hex);
    return email ? `href="mailto:${email}"` : original;
  })
  .replace(/<span class="__cf_email__" data-cfemail="([a-f0-9]+)">\[email&#160;protected\]<\/span>/gi, (original, hex) => decodeEmail(hex) || original)
  .replace(/<script data-cfasync="false" src="\/cdn-cgi\/scripts\/[a-f0-9]{8}\/cloudflare-static\/email-decode\.min\.js"><\/script>/gi, "");
