export function assertCanModifyUser(adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw new Error("You cannot modify your own admin account from this panel");
  }
}
