export const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR');
};

export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};