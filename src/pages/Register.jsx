import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div
      className="container"
      style={{ paddingTop: '0.5rem', paddingLeft: 0, paddingRight: 0, scale: '1.1' }}
    >
      <div className="card shadow-lg my-5 o-hidden border-0">
        <div className="card-body p-0">
          <div className="row">
            <div className="col-lg-5 d-none d-lg-flex">
              <div
                className="flex-grow-1 bg-register-image"
                style={{
                  backgroundImage:
                    'url("https://t4.ftcdn.net/jpg/01/81/65/85/360_F_181658575_6gz3Gx96iRndmBtXv2llVsGOGsfdT1AP.jpg")',
                }}
              ></div>
            </div>
            <div className="col-lg-7">
              <div className="p-5">
                <div className="text-center">
                  <h4 className="text-dark mb-4">Create an Account!</h4>
                </div>
                <form className="user">
                  <div className="mb-3 row">
                    <div className="col-sm-6 mb-3 mb-sm-0">
                      <input
                        className="form-control form-control-user"
                        type="text"
                        id="name"
                        placeholder="Name"
                        name="name"
                      />
                    </div>
                    <div className="col-sm-6">
                      <input
                        className="form-control form-control-user"
                        type="text"
                        id="userid"
                        placeholder="User ID"
                        name="user_id"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <input
                      className="form-control form-control-user"
                      type="email"
                      id="email"
                      aria-describedby="email"
                      placeholder="Email Address"
                      name="email"
                    />
                  </div>
                  <div className="mb-3 row">
                    <div className="col-sm-6 mb-3 mb-sm-0">
                      <input
                        className="form-control form-control-user"
                        type="password"
                        id="password"
                        placeholder="Password"
                        name="password"
                      />
                    </div>
                    <div className="col-sm-6">
                      <input
                        className="form-control form-control-user"
                        type="password"
                        id="password_repeat"
                        placeholder="Re-Enter Password"
                        name="password_repeat"
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary d-block w-100 btn-user" type="submit">
                    Register Account
                  </button>
                  <hr />
                </form>
                <div className="text-center"></div>
                <div className="text-center">
                  <Link className="small" to="/login">
                    Already have an account? Login!
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
