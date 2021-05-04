import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'

// 讓套件讀取 .env 檔案
// 讀取後可以用 process.env.變數 使用
dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

bot.on('message', async event => {
  if (event.message.type === 'text') {
    try {
      const response = await axios.get(`https://www.indievox.com/activity/list/${encodeURI(event.message.text)}`)
      const $ = cheerio.load(response.data)
      $('.panel-body').each(function (r) {
        const flex = {
          type: 'bubble',
          hero: {
            type: 'image',
            url: $(this).find('img').attr('src'),
            size: 'full',
            aspectRatio: '480:640',
            aspectMode: 'fit',
            action: {
              type: 'uri',
              uri: $(this).find('a').attr('href')
            }
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: $('.multi_ellipsis').eq(r).text(),
                weight: 'bold',
                size: 'md',
                wrap: true
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                spacing: 'sm',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: '時間',
                        color: '#aaaaaa',
                        size: 'sm',
                        flex: 1
                      },
                      {
                        type: 'text',
                        text: $('.date').eq(r).text(),
                        wrap: true,
                        color: '#666666',
                        size: 'sm',
                        flex: 5
                      }
                    ]
                  }
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'link',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: '前往購票網站',
                  uri: $(this).find('a').attr('href')
                }
              },
              {
                type: 'spacer',
                size: 'sm'
              }
            ],
            flex: 0
          }
        }
        console.log($(this).nextAll('.date'))
        // const response1 = await axios.get(`$(this).find('a').attr('href')`)
        const message = {
          type: 'flex',
          altText: $(this).text(),
          contents: {
            type: 'carousel',
            contents: [flex]
          }
        }
        event.reply(message)
      })
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
})
