import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-gray-300 text-left w-full">Home</button>
              </li>
              <li>
                <button onClick={() => console.log('Services clicked')} className="hover:text-gray-300 text-left w-full">Services</button>
              </li>
              <li>
                <button onClick={() => console.log('Contact clicked')} className="hover:text-gray-300 text-left w-full">Contact</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm">
              Email: info@example.com <br />
              Phone: +1 123 456 7890 <br />
              Address: 123 Main St, City, Country
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;