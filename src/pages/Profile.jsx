export default function Profile() {
  return (
    <>
      <h3 className="text-dark mb-4">Profile</h3>
      <div className="row mb-3">
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-body text-center shadow">
              <img
                className="rounded-circle mt-4 mb-3"
                src="/assets/img/dogs/image2.jpeg"
                width="160"
                height="160"
                alt="profile"
              />
              <div className="mb-3">
                <button className="btn btn-primary btn-sm" type="button">
                  Change Photo
                </button>
              </div>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="text-primary m-0 fw-bold">Projects</h6>
            </div>
            <div className="card-body">
              <h4 className="small fw-bold">
                Server migration<span className="float-end">20%</span>
              </h4>
              <div className="progress mb-3 progress-sm">
                <div
                  className="progress-bar bg-danger"
                  aria-valuenow="20"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '20%' }}
                >
                  <span className="visually-hidden">20%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Sales tracking<span className="float-end">40%</span>
              </h4>
              <div className="progress mb-3 progress-sm">
                <div
                  className="progress-bar bg-warning"
                  aria-valuenow="40"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '40%' }}
                >
                  <span className="visually-hidden">40%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Customer Database<span className="float-end">60%</span>
              </h4>
              <div className="progress mb-3 progress-sm">
                <div
                  className="progress-bar bg-primary"
                  aria-valuenow="60"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '60%' }}
                >
                  <span className="visually-hidden">60%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Payout Details<span className="float-end">80%</span>
              </h4>
              <div className="progress mb-3 progress-sm">
                <div
                  className="progress-bar bg-info"
                  aria-valuenow="80"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '80%' }}
                >
                  <span className="visually-hidden">80%</span>
                </div>
              </div>
              <h4 className="small fw-bold">
                Account setup<span className="float-end">Complete!</span>
              </h4>
              <div className="progress mb-3 progress-sm">
                <div
                  className="progress-bar bg-success"
                  aria-valuenow="100"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  style={{ width: '100%' }}
                >
                  <span className="visually-hidden">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="row mb-3 d-none">
            <div className="col">
              <div className="card text-white bg-primary shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Peformance</p>
                      <p className="m-0">
                        <strong>65.2%</strong>
                      </p>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-rocket fa-2x"></i>
                    </div>
                  </div>
                  <p className="text-white-50 m-0 small">
                    <i className="fas fa-arrow-up"></i>&nbsp;5% since last month
                  </p>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card text-white bg-success shadow">
                <div className="card-body">
                  <div className="row mb-2">
                    <div className="col">
                      <p className="m-0">Peformance</p>
                      <p className="m-0">
                        <strong>65.2%</strong>
                      </p>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-rocket fa-2x"></i>
                    </div>
                  </div>
                  <p className="text-white-50 m-0 small">
                    <i className="fas fa-arrow-up"></i>&nbsp;5% since last month
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="card shadow mb-3">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">User Settings</p>
                </div>
                <div className="card-body">
                  <form>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="username">
                            <strong>Username</strong>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            id="username"
                            placeholder="user.name"
                            name="username"
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="email">
                            <strong>Email Address</strong>
                          </label>
                          <input
                            className="form-control"
                            type="email"
                            id="email"
                            placeholder="user@example.com"
                            name="email"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="first_name">
                            <strong>Name</strong>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            id="first_name"
                            placeholder="John"
                            name="first_name"
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="last_name">
                            <strong>Role</strong>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            id="last_name"
                            placeholder="Doe"
                            name="last_name"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-primary btn-sm" type="submit">
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card shadow">
                <div className="card-header py-3">
                  <p className="text-primary m-0 fw-bold">Contact Settings</p>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="address">
                        <strong>Address</strong>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        id="address"
                        placeholder="Sunset Blvd, 38"
                        name="address"
                      />
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="city">
                            <strong>City</strong>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            id="city"
                            placeholder="Los Angeles"
                            name="city"
                          />
                        </div>
                      </div>
                      <div className="col">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="country">
                            <strong>Country</strong>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            id="country"
                            placeholder="USA"
                            name="country"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-primary btn-sm" type="submit">
                        Save&nbsp;Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow mb-5"></div>
    </>
  )
}
