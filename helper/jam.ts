export function userIsInJam(user, jam) {
  return jam.users.filter((jamUser) => user.id === jamUser.id).length > 0;
}
