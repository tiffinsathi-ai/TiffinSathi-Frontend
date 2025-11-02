import React from "react";
import {
  HiHeart,
  HiTruck,
  HiTag,
  HiSearch,
  HiCube,
  HiCog,
  HiEmojiHappy,
} from "react-icons/hi";
import { FaLeaf } from "react-icons/fa";
import homeBg from "../assets/home.jpg";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homeBg})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Eat Fresh. Healthy{" "}
              <span style={{ color: "#4A8C39" }}>Tiffin</span> Delivered{" "}
              <span style={{ color: "#4A8C39" }}>Daily</span> to Your Door.
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Experience the authentic taste of home with our freshly prepared
              tiffin meals. Made with love in clean kitchens, delivered with
              care to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                className="px-8 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-colors text-white"
                style={{ backgroundColor: "#F5B800" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e0a500")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F5B800")
                }
              >
                <HiSearch className="w-5 h-5" />
                <span>Explore Packages</span>
              </button>
              <button className="px-8 py-3 rounded-lg flex items-center gap-2 font-medium border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <span>How It Works</span>
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Tiffin Sathi Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Why Choose{" "}
                <span style={{ color: "#4A8C39" }}>Tiffin Sathi</span>?
              </h2>
              <p className="text-lg text-gray-600">
                We bring the warmth of home-cooked meals to your busy lifestyle
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Benefit Card 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiHeart className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Homemade Fresh
                </h3>
                <p className="text-gray-600 text-center">
                  Prepared daily with love in clean home kitchens
                </p>
              </div>

              {/* Benefit Card 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiTruck className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  On-Time Delivery
                </h3>
                <p className="text-gray-600 text-center">
                  Hot meals delivered right to your doorstep
                </p>
              </div>

              {/* Benefit Card 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <FaLeaf className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Healthy & Organic
                </h3>
                <p className="text-gray-600 text-center">
                  Fresh ingredients, nutritious and balanced meals
                </p>
              </div>

              {/* Benefit Card 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <HiTag className="w-8 h-8" style={{ color: "#F5B800" }} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Affordable Pricing
                </h3>
                <p className="text-gray-600 text-center">
                  Great value meals that fit your budget
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple steps to get fresh, homemade meals delivered to your door
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        1
                      </span>
                      <HiCube
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600">
                  Select from daily, weekly, or monthly meal packages that suit
                  your needs
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        2
                      </span>
                      <HiCog
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Customize Meals
                </h3>
                <p className="text-gray-600">
                  Personalize your meals according to your preferences and
                  dietary requirements
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#FFF4E6" }}
                  >
                    <div className="relative">
                      <span
                        className="text-3xl font-bold absolute -top-2 -left-2"
                        style={{ color: "#F5B800" }}
                      >
                        3
                      </span>
                      <HiEmojiHappy
                        className="w-10 h-10"
                        style={{ color: "#4A8C39" }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Enjoy Fresh Food
                </h3>
                <p className="text-gray-600">
                  Receive delicious, hot meals at your doorstep and enjoy the
                  authentic taste of home
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
