export async function getTeacherDetail(name: string) {
  const path = "https://stankin.ru/api_entry.php";

  const optionsSearchInfo = {
    method: "POST",
    uri: path,
    body: {
      action: "search",
      data: {
        type: "users",
        query: name,
        page: 1,
        count: 20,
      },
    },
    timeout: 2000,
    json: true,
  };

  try {
    const searchInfoResponse = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(optionsSearchInfo.body),
    });
    const infoResponse = (await searchInfoResponse.json()) as any;
    if (infoResponse) {
      if (infoResponse.data.founded.length > 0) {
        const { id } = infoResponse.data.founded[0];
        const subdivisionId =
          infoResponse.data.founded[0].payload.subdivision_id;

        const optionsTeacherInfo = {
          method: "POST",
          uri: path,
          body: {
            action: "getStuff",
            data: { subdivision_id: subdivisionId },
          },
          json: true,
        };
        const teacherInfoResponse = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(optionsTeacherInfo.body),
        });
        const teacherResponse = (await teacherInfoResponse.json()) as any;
        if (teacherResponse) {
          const { email, phone, avatar } = teacherResponse.data.filter(
            (row: any) => row.user.id === id
          )[0].user;

          return {
            email: email !== "example@mail.com" ? email : null,
            phone,
            avatar,
          };
        }
      }
    }
  } catch (e) {
    return {};
  }

  return {};
}
