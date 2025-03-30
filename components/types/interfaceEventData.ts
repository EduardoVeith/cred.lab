export default interface EventData {
    title: string;
    imageUrl?: string;
    category: string;
    startDate: string
    endDate: string;
    description: string;
    time: string;
    guests?: any[];
    address: {
        locationName: string;
        street: string;
        number: string;
        cep: string;
        neighborhood: string;
        city: string;
        state: string;
        complement?: string;
    };
  }