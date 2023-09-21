export function getRating(
  subjects: {
    marks: {
      [x: string]: number;
    };
    subject: string;
    factor: number;
  }[]
) {
  const isAll =
    subjects.length > 0
      ? subjects.every((subject) =>
          Object.keys(subject.marks).every((module) => {
            const value = subject.marks[module];
            const factor = subject.factor;

            return value >= 25 && factor > 0;
          })
        )
      : false;

  if (isAll) {
    let sum = 0;
    let sumFactor = 0;

    subjects.forEach((subject) => {
      let sumFactorSubject = 0;
      let sumSubject = 0;

      const factor = subject.factor;

      Object.keys(subject.marks).forEach((module) => {
        const value = subject.marks[module];

        if (module === "М1") {
          sumFactorSubject += 3;
          sumSubject += value * 3;
        } else if (module === "М2") {
          sumFactorSubject += 2;
          sumSubject += value * 2;
        } else if (module === "З") {
          sumFactorSubject += 5;
          sumSubject += value * 5;
        } else if (module === "К") {
          sumFactorSubject += 5;
          sumSubject += value * 5;
        } else if (module === "Э") {
          sumFactorSubject += 7;
          sumSubject += value * 7;
        }
      });

      sumFactor += factor;
      sum += (sumSubject / sumFactorSubject) * factor;
    });

    const rating = sum / sumFactor;

    return rating;
  }

  return null;
}
export function getFilteredMarks(
  marks: {
    value: number;
    module: string;
    subject: string;
    factor: number;
  }[]
) {
  const groups = [];

  for (let element of marks) {
    let existingGroups = groups.filter(
      (group) => group.subject === element.subject
    );
    if (existingGroups.length > 0) {
      existingGroups[0].marks[`${element.module}`] = element.value;
    } else {
      let newGroup = {
        marks: {
          [`${element.module}`]: element.value,
        },
        subject: element.subject,
        factor: element.factor,
      };
      groups.push(newGroup);
    }
  }

  return groups;
}
