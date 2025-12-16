"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type TestimonialData = {
  heading: string;
  title: string;
  testimonials: Array<{
    id: number;
    name: string;
    city: string;
    text: string;
    rating: number;
  }>;
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [content, setContent] = useState<TestimonialData>({
    heading: "Apa Kata Mereka?",
    title: "Ribuan pelanggan puas telah merasakan kualitas Zari Life",
    testimonials: TESTIMONIALS,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/admin/testimonial-content");
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (error) {
        console.error("Error fetching testimonial content:", error);
      }
    };

    fetchContent();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-20 lg:py-32 bg-amber-50/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {content.heading}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            {content.title}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {content.testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <Card className="h-full bg-white border-2 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 sm:p-8">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>

                      {/* Testimonial text */}
                      <p className="text-gray-700 mb-6 leading-relaxed italic">
                        "{testimonial.text}"
                      </p>

                      {/* Author */}
                      <div>
                        <p className="font-bold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.city}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
