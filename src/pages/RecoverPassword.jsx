import { Link } from 'react-router-dom'

export default function RecoverPassword() {
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
                      <h4 className="text-dark mb-4">Reset Password</h4>
                    </div>
                    <form className="user">
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="email"
                          id="email"
                          aria-describedby="email"
                          placeholder="Email"
                          name="email"
                        />
                      </div>
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="password"
                          id="otp"
                          placeholder="OTP"
                          name="otp"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="custom-checkbox small"></div>
                      </div>
                      <button className="btn btn-primary d-block w-100 btn-user" type="submit">
                        Submit
                      </button>
                      <hr />
                    </form>
                    <div className="text-center"></div>
                    <div className="text-center">
                      <Link className="small" to="/login">
                        Login
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
