const whatsappLink =
  "https://wa.me/351910202328?text=Olá!%20Vim%20pelo%20site%20Raffafe.arte%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20materiais.";

export const ContactCard = () => {
  return (
    <section className="mt-16 px-4">
      <div className="rounded-[2rem] bg-watercolor p-8 md:p-10 text-center shadow-soft max-w-2xl mx-auto">
        <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight">
          Precisa de algo que não está aqui?
        </h3>

        <p className="mt-3 text-muted-foreground">
          Posso te ajudar com materiais, ideias criativas e sugestões para sua turma.
        </p>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center mt-6 rounded-full bg-primary px-8 py-4 text-primary-foreground font-medium transition hover:opacity-90"
        >
          Fale comigo
        </a>

        <div className="mt-8 text-sm text-muted-foreground space-y-1">
          <p>WhatsApp: +351 910 202 328</p>
          <p>Instagram: @raffafe.arte</p>
          <p>Email: irsf84@gmail.com</p>
        </div>
      </div>
    </section>
  );
};
