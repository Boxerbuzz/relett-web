
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is blockchain-based property verification?',
    answer: 'Our blockchain-based verification creates immutable records of property ownership and transactions, ensuring complete transparency and eliminating fraud.'
  },
  {
    question: 'How does property tokenization work?',
    answer: 'Property tokenization allows you to convert real estate assets into digital tokens, enabling fractional ownership and easier investment opportunities.'
  },
  {
    question: 'Is my data secure on Relett?',
    answer: 'Yes, we use advanced encryption and blockchain technology to ensure your data is completely secure and tamper-proof.'
  },
  {
    question: 'Can I use Relett for commercial properties?',
    answer: 'Absolutely! Relett supports both residential and commercial property management, verification, and tokenization.'
  },
  {
    question: 'What are the fees for using Relett services?',
    answer: 'Our pricing is transparent and competitive. Contact our sales team for detailed pricing information based on your specific needs.'
  }
];

export function FAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Relett
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
