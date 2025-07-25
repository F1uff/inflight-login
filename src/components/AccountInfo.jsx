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

      <main className="main-content account-page" style={{paddingLeft: '40px', paddingRight: '200px'}}>
        <div className="account-container" style={{marginLeft: '20px', marginRight: '20px', maxWidth: 'calc(100% - 240px)'}}>
          <h2 className="section-title" style={{paddingLeft: '20px'}}>Account Information</h2>
          <div className="info-section" style={{paddingLeft: '20px', paddingRight: '20px', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0'}}>
            <div className="form-group full-width">
              <label htmlFor="email-address">Email Address<span className="required">*</span></label>
              <div className="field-note">(Nominate generic and permanent company email address only)</div>
              <input type="email" id="email-address" name="emailAddress" className="form-control" />
            </div>

            <div className="form-group full-width">
              <label>Business Address <span className="note">(as reflected in the DOT Certificate)</span></label>
            </div>

            <div className="form-row">
              <div className="form-group">
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
                <label htmlFor="house-street">House No./Bldg./ Street</label>
                <input type="text" id="house-street" name="houseStreet" className="form-control" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{maxWidth: '150px'}}>
                <label htmlFor="zip-code-info">Zip Code<span className="required">*</span></label>
                <input type="text" id="zip-code-info" name="zipCode" className="form-control" placeholder="0000" maxLength="4" />
              </div>
              <div className="form-group">
                <label>Office Contact No.<span className="required">*</span></label>
                <div className="phone-inputs">
                  <input type="text" id="area-code-info" name="areaCode" className="form-control area-code" placeholder="Area Code" maxLength="3" />
                  <input type="text" id="phone-number-info" name="phoneNumber" className="form-control phone-number" placeholder="Contact Number" />
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
