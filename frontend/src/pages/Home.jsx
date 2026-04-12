import jobImg from "/src/photo/job.jpg";
import coupleImg from "/src/photo/couple.jpg";
import { FaFacebookF, FaYoutube, FaEnvelope, FaWhatsapp } from 'react-icons/fa'; 

function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      
      {/* HERO SECTION remains the same as above... */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* LEFT SIDE: Your Dream Job */}
        <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen overflow-hidden">
          <img src={jobImg} alt="Office" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 text-white">
            <p className="text-sm uppercase tracking-widest opacity-80">Find your career</p>
            <h1 className="mt-2 text-4xl md:text-6xl font-bold">
              Your Dream <br />
              <span className="text-blue-400">Job is Waiting</span>
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE: Your Dream Partner */}
        <div className="relative w-full md:w-1/2 h-[50vh] md:h-screen overflow-hidden">
          <img src={coupleImg} alt="Couple" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-indigo-900/30"></div>
          <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 text-white text-right">
            <p className="text-sm uppercase tracking-widest opacity-80">Find your soulmate</p>
            <h2 className="mt-2 text-4xl md:text-6xl font-bold">
            Find Your <br />
              <span className="text-blue-400">Dream Partner</span>
            </h2>
            <p className="mt-4 text-lg opacity-90">Choose the right expert, find your soulmate.</p>
          </div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="bg-[#121b18] text-gray-300 py-16 px-8 md:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-white max-w-md leading-tight">
              Sip Your Way To Wellness – One Cup At A Time.
            </h2>
            <div className="w-full md:w-auto">
              <p className="text-white font-medium mb-4">Stay Connected!</p>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent border border-gray-600 rounded-full py-3 px-6 w-full md:w-80 focus:outline-none focus:border-green-500"
                />
                <button className="absolute right-1.5 bg-[#006d44] hover:bg-green-700 text-white px-6 py-2 rounded-full text-sm transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Contact Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <FaEnvelope className="text-green-500" />
                <span className="text-sm text-white">anomymous139@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FaWhatsapp className="text-green-500" />
                <a href="https://wa.me/9219916121" target="_blank" rel="noreferrer" className="text-sm hover:text-white">
                  +91 9219916121
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Follow Us</h3>
              <div className="flex gap-4">
                {/* Your Updated Facebook Link */}
                <a 
                  href="https://www.facebook.com/share/18XQc5hr4Z/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-white text-black p-2 rounded-full hover:bg-blue-600 hover:text-white transition"
                >
                  <FaFacebookF />
                </a>
                {/* WhatsApp Direct Link */}
                <a 
                  href="https://wa.me/9219916121" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-white text-black p-2 rounded-full hover:bg-green-500 hover:text-white transition"
                >
                  <FaWhatsapp />
                </a>
                <a 
                  href="#" 
                  className="bg-white text-black p-2 rounded-full hover:bg-red-600 hover:text-white transition"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-xs text-gray-500">
            <p>© 2025 Tea Circle. All Rights Reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms & condition</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;