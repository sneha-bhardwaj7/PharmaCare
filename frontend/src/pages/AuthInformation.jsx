"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Store,
  PackageSearch,
  FileText,
  Truck,
  HeartPulse,
  Phone,
  Award,
  Activity,
  ShoppingCart,
  CheckCircle,
  Star,
  Users,
  Shield,
  Heart,
  BadgeCheck,
  Lock,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react"
import serviceImg1 from "../assets/serviceImg1.png"
import digitalP from "../assets/digitalP.jpg"
import delivery from "../assets/delivery.jpg"

export default function AuthInformation() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const testimonials = [
    {
      id: 1,
      text: "PharmaCare saved me so much time! I found my medicines in minutes and got them delivered the same day. The digital prescription feature is a game-changer!",
      author: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      rating: 5,
      icon: Users,
    },
    {
      id: 2,
      text: "As a pharmacist, PharmaCare has transformed how I manage my inventory and reach customers. The platform is intuitive and the support team is excellent!",
      author: "Rajesh Kumar",
      location: "Delhi NCR",
      rating: 5,
      icon: Shield,
    },
    {
      id: 3,
      text: "The 24/7 consultation service is amazing! I can get expert advice anytime I need it. PharmaCare truly cares about customer health and convenience.",
      author: "Anita Desai",
      location: "Bangalore, Karnataka",
      rating: 5,
      icon: Heart,
    },
    {
      id: 4,
      text: "Delivery in 15 minutes is not an exaggeration. I ordered my blood pressure medication and it arrived before I could even prepare the payment. Absolutely brilliant!",
      author: "Vikram Singh",
      location: "Hyderabad, Telangana",
      rating: 5,
      icon: Heart,
    },
  ]

  useEffect(() => {
    if (!isAutoPlay) return
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlay, testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlay(false)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlay(false)
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      

      {/* Stats Section */}
      <section className="py-10 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div
              className="space-y-2 transform hover:scale-110 transition-transform duration-300 animate-fade-in"
              style={{ animationDelay: "0s" }}
            >
              <div className="text-5xl font-bold">50K+</div>
              <div className="text-blue-100 font-semibold">Medicines Available</div>
            </div>
            <div
              className="space-y-2 transform hover:scale-110 transition-transform duration-300 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-5xl font-bold">1000+</div>
              <div className="text-blue-100 font-semibold">Partner Pharmacies</div>
            </div>
            <div
              className="space-y-2 transform hover:scale-110 transition-transform duration-300 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-5xl font-bold">15 Min</div>
              <div className="text-blue-100 font-semibold">Average Delivery</div>
            </div>
            <div
              className="space-y-2 transform hover:scale-110 transition-transform duration-300 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-5xl font-bold">4.8★</div>
              <div className="text-blue-100 font-semibold">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-8 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob "></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            {/* <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Simple & Seamless Process</span>
            </div> */}
            <h2 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Get your medicines delivered in just <span className="font-bold text-blue-600">three simple steps</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Animated connecting line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 mx-auto" style={{ width: "75%", left: "12.5%" }}>
              <div className="h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-indigo-400 animate-shimmer"></div>
              </div>
            </div>

            {/* Step 1 */}
            <div className="relative text-center group animate-slide-up">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-blue-200 relative z-10 transition-all duration-500 hover:shadow-blue-300/50 hover:-translate-y-2 hover:border-blue-300">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                    1
                  </div>
                </div>
                <div className="mt-8 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-6 w-fit mx-auto relative group-hover:scale-110 transition-transform duration-300">
                    <PackageSearch className="h-14 w-14 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Search Medicine</h3>
                <p className="text-gray-600 leading-relaxed">
                  Enter medicine name or upload prescription to find available options nearby
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-indigo-200 relative z-10 transition-all duration-500 hover:shadow-indigo-300/50 hover:-translate-y-2 hover:border-indigo-300">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                    2
                  </div>
                </div>
                <div className="mt-8 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-6 w-fit mx-auto relative group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-14 w-14 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">Place Order</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select your pharmacy, add to cart, and proceed with secure payment options
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center group animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-purple-200 relative z-10 transition-all duration-500 hover:shadow-purple-300/50 hover:-translate-y-2 hover:border-purple-300">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-2xl group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                    3
                  </div>
                </div>
                <div className="mt-8 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-6 w-fit mx-auto relative group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-14 w-14 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Get Delivered</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive medicines at your doorstep within <span className="font-bold text-purple-600">15-30 minutes</span> with live tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Store className="h-4 w-4" />
              <span>Comprehensive Healthcare Solutions</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
           
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4">

                <div className="bg-gray-600 rounded-2xl p-4 w-fit mb-6  group-hover:scale-110 transition-transform">
                <PackageSearch className="h-20 w-10 text-white" />
              </div>

                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100">
                <img
                  src={serviceImg1}
                  alt="Find Medicines"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Medicines</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Search from thousands of genuine medicines across nearby pharmacies in real-time.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Real-time stock updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Compare prices instantly</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4">

                <div className="bg-yellow-600 rounded-2xl p-4 w-fit mb-6  group-hover:scale-110 transition-transform">
                <FileText className="h-20 w-10 text-white" />
              </div>

                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-200 to-yellow-100">
                <img
                  src={digitalP}
                  alt="Digital Prescriptions"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Prescriptions</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Upload and manage your prescriptions digitally. Access them anytime, anywhere.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Secure cloud storage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Easy sharing with doctors</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4"> 
                <div className="bg-pink-600 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Truck className="h-20 w-10 text-white" />
              </div>

                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 to-pink-100">
                <img
                  src={delivery}
                  alt="Fast Delivery"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Get medicines delivered to your doorstep in just 15 minutes. Free shipping available.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>GPS-tracked delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Contact-free options</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4">

                <div className="bg-green-600 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse className="h-20 w-10 text-white" />
              </div>


                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-green-200 to-green-100">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Health Monitoring"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Health Monitoring</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your medications, set reminders, and monitor your health journey with our smart tools.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg border-2 border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4">

                <div className="bg-purple-600 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Phone className="h-20 w-10 text-white" />
              </div>

                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-purple-200 to-purple-100">
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="24/7 Consultation"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              

              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Consultation</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with licensed pharmacists anytime for medication advice and health queries.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-lg border-2 border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden">
              <div className="flex items-start gap-4">

                <div className="bg-orange-600 rounded-2xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-20 w-10 text-white" />
              </div>

                <div className="relative h-30 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-orange-200 to-orange-100">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Loyalty Rewards"
                  className="w-150 h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Loyalty Rewards</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn points on every purchase and unlock exclusive discounts and health benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Testimonials Carousel Section */}
      <section id="testimonials" className="py-8 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-2 mt-4">
              <Star className="h-4 w-4" />
              <span>Trusted by Thousands</span>
            </div>
            <h2 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real experiences from real people using PharmaCare
            </p>
          </div>

          <div className="relative">
            {/* Carousel Container */}
            <div className="flex items-center justify-between gap-6">
              <button
                onClick={prevTestimonial}
                className="absolute -left-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Main Carousel */}
              <div className="flex-1 overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                      <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 min-h-96 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-1 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-6 leading-relaxed italic text-lg">"{testimonial.text}"</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4">
                            <testimonial.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{testimonial.author}</div>
                            <div className="text-sm text-gray-600">{testimonial.location}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextTestimonial}
                className="absolute -right-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTestimonial(index)
                    setIsAutoPlay(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? "bg-blue-600 w-8" : "bg-gray-300 hover:bg-blue-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Shield className="h-4 w-4" />
              <span>Your Safety is Our Priority</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Why Trust PharmaCare?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing safe, genuine, and reliable healthcare solutions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: BadgeCheck,
                title: "100% Genuine",
                desc: "All medicines are sourced from licensed distributors",
                delay: "0s",
              },
              {
                icon: Lock,
                title: "Secure Payment",
                desc: "Bank-grade encryption for all transactions",
                delay: "0.1s",
              },
              {
                icon: Shield,
                title: "Licensed Pharmacies",
                desc: "Only verified and certified pharmacy partners",
                delay: "0.2s",
              },
              {
                icon: HeartPulse,
                title: "Quality Assured",
                desc: "Temperature-controlled storage and delivery",
                delay: "0.3s",
              },
            ].map((item, i) => {
              const IconComp = item.icon
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300 transform animate-fade-in"
                  style={{ animationDelay: item.delay }}
                >
                  <div className="bg-blue-600 rounded-full p-4 w-fit mx-auto mb-4">
                    <IconComp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {/* <section id="contact" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Phone className="h-4 w-4" />
                <span>Get In Touch</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Have Questions? We're Here to Help!</h2>
              <p className="text-xl text-gray-600 mb-8">Our support team is available 24/7 to assist you with any queries or concerns.</p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-xl p-3">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Call Us</div>
                    <div className="text-gray-600">+91 1800-123-456 (Toll Free)</div>
                    <div className="text-sm text-gray-500">Available 24/7</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-xl p-3">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Email Us</div>
                    <div className="text-gray-600">support@pharmacare.com</div>
                    <div className="text-sm text-gray-500">Response within 2 hours</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-xl p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Visit Us</div>
                    <div className="text-gray-600">123 Healthcare Street, Mumbai, MH 400001</div>
                    <div className="text-sm text-gray-500">Mon-Sat: 9AM - 6PM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-xl border-2 border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  />
                </div>
                <div>
                  <textarea
                    rows="4"
                    placeholder="Your Message"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Send Message</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of satisfied customers who trust PharmaCare for their healthcare needs
          </p>
          <button className="px-12 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Download PharmaCare App
          </button>
        </div>
      </section>
    </div>
  )
}
