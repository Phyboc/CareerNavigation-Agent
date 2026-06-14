import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import CareerJourneyPreview from "../components/landing/CareerJourneyPreview";
import Testimonials from "../components/landing/Testimonials";
import WhyCareerCompass from "../components/landing/WhyCareerCompass";

export default function HomePage() {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
			<Hero />
			<Features />
			<HowItWorks />
			<CareerJourneyPreview />
			<WhyCareerCompass />
			<Testimonials />
		</div>
	);
}
