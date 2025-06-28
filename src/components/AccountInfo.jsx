import React from 'react';
import { Link } from 'react-router-dom';
import corporateLogo from '../assets/corporate-logo.png';

function AccountInfo() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <img src={corporateLogo} alt="Corporate Logo" />
          <span>THE INFLIGHT MENU</span>
        </div>
        <nav className="nav-links">
          <a href="#">TIM OFFICIAL WEBSITE</a>
          <a href="#">CONTACT</a>
        </nav>
      </header>

      <main className="main-content account-page">
        <div className="account-container">
          <h2 className="section-title">Account Information</h2>
          <div className="info-section">
            <div className="form-group full-width">
              <label>Email Address<span className="required">*</span></label>
              <div className="field-note">(Nominate generic and permanent company email address only)</div>
              <input type="email" className="form-control" />
            </div>

            <div className="form-group full-width">
              <label>Business Address <span className="note">(as reflected in the DOT Certificate)</span></label>
            </div>

            <div className="form-row">
              <div className="for m-group">
                <label>Region<span className="required">*</span></label>
                <select className="form-control">
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>Province<span className="required">*</span></label>
                <select className="form-control">
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>City/Municipality<span className="required">*</span></label>
                <select className="form-control">
                  <option>- Select -</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Barangay<span className="required">*</span></label>
                <select className="form-control">
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>House No./Bldg./ Street</label>
                <input type="text" className="form-control" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Zip Code<span className="required">*</span></label>
                <input type="text" className="form-control" />
              </div>
              <div className="form-group">
                <label>Office Contact No.<span className="required">*</span></label>
                <div className="phone-inputs">
                  <input type="text" className="form-control area-code" placeholder="Area Code" />
                  <input type="text" className="form-control phone-number" placeholder="Number" />
                </div>
              </div>
            </div>
          </div>

          <div className="button-row">
            <button className="btn-next">
              <Link to="/company-info">Next</Link>
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#">HELP</a>
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
        </div>
      </footer>
    </div>
  );
}

export default AccountInfo;
