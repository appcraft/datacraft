import data from './data'

const tableData = data.results.map(d => ({
  gender: d.gender,
  firstName: d.name.first,
  lastName: d.name.last,
  email: d.email,
  username: d.login.username,
  password: d.login.password,
  phone: d.phone,
  thumbnail: d.picture.thumbnail,
  nat: d.nat,
  location: `${d.location.street}, ${d.location.city}, ${d.location.postcode, d.location.state}`
}))

export default tableData