import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div
      className="container"
      style={{ scale: '1.1', paddingTop: '0.5rem', paddingLeft: 0, paddingRight: 0 }}
    >
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-12 col-xl-10">
          <div className="card shadow-lg my-5 o-hidden border-0">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-6 d-none d-lg-flex">
                  <div
                    className="flex-grow-1 bg-login-image"
                    style={{
                      backgroundImage:
                        'url("https://t4.ftcdn.net/jpg/01/81/65/85/360_F_181658575_6gz3Gx96iRndmBtXv2llVsGOGsfdT1AP.jpg")',
                    }}
                  ></div>
                </div>
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center">
                      <h4 className="text-dark mb-4">Welcome Back!</h4>
                    </div>
                    <form className="user">
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="email"
                          id="exampleInputEmail"
                          aria-describedby="user_id"
                          placeholder="User ID"
                          name="user_id"
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="password"
                          id="exampleInputPassword"
                          placeholder="Password"
                          name="password"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="custom-checkbox small">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="formCheck-1"
                            />
                            <label className="form-check-label" htmlFor="formCheck-1">
                              Remember Me
                            </label>
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-primary d-block w-100 btn-user" type="submit">
                        Login
                      </button>
                      <hr />
                    </form>
                    <div className="text-center">
                      <Link className="small" to="/recover-password">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link className="small" to="/register">
                        Create an Account!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
