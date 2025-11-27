export interface tournament {
    name: string;
    location: string;
    playType: "SINGLE" | "DOUBLE" | any;
    rank: "BG" | "NB" | "N" | "S" | "P_MINUS" | "P_PLUS" | any;
    shuttlePrice: string;
    maxPlayers: string;
    posterImg: string | File | null;
    qrCodeImg: string | File | null;
    startDate: string;
    ruleId: string | null;
    isLowerBracket: boolean;
}

// export interface manageForm {
//     date : string,
//   setDate: React.Dispatch<React.SetStateAction<string>>;
//   location : string,
//   tournamentName : string,
//   setTournamentName : React.Dispatch<React.SetStateAction<string>>;

//   setLocation : React.Dispatch<React.SetStateAction<string>>;
//   shuttlecockPrice : string,
//   setShuttlecockPrice : React.Dispatch<React.SetStateAction<string>>;
//   ranks : string[],
//   setRanks  :() =>  void,
//   types : string[],
//   setTypes :() =>  void,
//   bracketLines: string[],
//   setBracketLines :() =>  void,
//   people : number | null,
//   setPeople :() =>  void,
//   handleUpload :() =>  void,
//   posterPreview : string | null,
//   qrPreview : string | null,
//   handleNext :() =>  void,
//   isFormComplete : boolean,
//   levelOptions :  levelOptions,
//   toggleValue:(arr: string[], val: string, setArr: React.Dispatch<React.SetStateAction<string[]>>) =>  void,
// }

// interface levelOptions  {
//     label : string,
//     value : string
// }