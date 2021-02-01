const { JSDOM } = require('jsdom');
const qs = require('qs');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const editNoticeHTML = (client, roomId, event, html, plain) => client.sendMessage(roomId, {
  body: ` * ${plain || html.replace(/<[^<]+?>/g, '')}`,
  formatted_body: ` * ${html}`,
  format: 'org.matrix.custom.html',
  msgtype: 'm.notice',
  'm.new_content': {
    body: plain || html.replace(/<[^<]+?>/g, ''),
    formatted_body: html,
    format: 'org.matrix.custom.html',
    msgtype: 'm.notice'
  },
  'm.relates_to': {
    rel_type: 'm.replace',
    event_id: event.event_id
  }
});

const headers = ({ domain, userAgent }) => ({
  'Host': `${domain}`,
  'User-Agent': `${userAgent}`
});

const archive = async (instance, url, rearchive) => {
  const form = await instance({ method: 'GET', url: '/' });
  if (form.statusText !== 'OK') throw form;
  const submitId = form.data.match(/name="submitid" value="([^"]+)/);
  const submit = await instance({
    method: 'POST',
    url: '/submit/',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({ anyway: rearchive ? '1' : undefined, submitid: submitId ? submitId[1] : undefined, url })
  });
  submit.title = new JSDOM(submit.data).window.document.title;
  if (submit.statusText !== 'OK') throw submit;
  if (submit.request.path !== '/submit/')
    return { id: submit.request.path, date: submit.headers['memento-datetime'], title: submit.title };
  if (submit.headers.refresh)
    return { refresh: submit.headers.refresh.split(';url=')[1] };
  throw submit;
};

const reqStr = str => `<em>Sending archive request for <code>${str}</code></em>`;
const arc1Str = str => `<em>Archiving page <code>${str}</code></em>`;
const arc2Str = (str, title, date) => `<em>Archived page <code><a href="https://${str}">${str}</code> [${date}]</em><br /><b>${title}</b>`;
const arc3Str = str => `<em>Timed out <code>${str}</code></em>`;

const run = async (matrixClient, { roomId }, userInput, rearchive) => {
  const instance = axios.create({
    baseURL: `https://${config.archive.domain}`,
    headers: headers(config.archive),
    transformResponse: [],
    timeout: 10 * 1000
  });

  let reply = null;
  try {
    reply = await matrixClient.sendHtmlNotice(roomId, '', reqStr(userInput));
    const { refresh, id, title, date } = await archive(instance, userInput, rearchive);
    if (id)
      return await editNoticeHTML(matrixClient, roomId, reply, arc2Str(`${config.archive.domain}${id}`, title, date));
    if (refresh) {
      const path = refresh.split(`https://${config.archive.domain}`);
      if (!path[1]) throw refresh;
      await editNoticeHTML(matrixClient, roomId, reply, arc1Str(refresh));
      let tries = 30;
      while (tries--) {
        await sleep(10000);
        const { title, date, id } = await archive(instance, userInput);
        if (rearchive == false && title !== undefined)
          return await editNoticeHTML(matrixClient, roomId, reply, arc2Str(`${config.archive.domain}${id}`, title, date));
        const { request: { path: reqPath }, headers: { 'memento-datetime': rearchiveDate } } = await instance({ method: 'HEAD', url: path[1] })
            .catch(e => ({ request: { path: path[1] } }));
        if (rearchive == true && reqPath !== path[1])
          return await editNoticeHTML(matrixClient, roomId, reply, arc2Str(`${config.archive.domain}${reqPath}`, title, rearchiveDate));
      }
      return await editNoticeHTML(matrixClient, roomId, reply, arc3Str(refresh));
    }
    throw 'sad';
  } catch (e) {
    const sad = `<strong>Sad!</strong><br /><code>${`${e}`.replace(/<[^<]+?>/g, '').substr(0, 100)}</code>`;
    if (reply)
      editNoticeHTML(matrixClient, roomId, reply, sad, 'sad').catch(() => {});
    else
      matrixClient.sendHtmlNotice(roomId, 'sad', sad).catch(() => {});
  }
};

exports.runQuery = run;
