// LIFF helper
export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '2010290578-odw3e7nF'

export async function initLiff() {
  const liff = (await import('@line/liff')).default
  await liff.init({ liffId: LIFF_ID })
  return liff
}

export async function getLiffProfile() {
  const liff = await initLiff()
  if (!liff.isLoggedIn()) return null
  const profile = await liff.getProfile()
  return {
    lineUserId: profile.userId,
    displayName: profile.displayName,
    pictureUrl:  profile.pictureUrl,
  }
}
