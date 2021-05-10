import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

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
      const response1 = await axios.get(`https://tixcraft.com/activity/list/search/${encodeURI(event.message.text)}`)
      // const response2 = await axios.get(`https://kktix.com/events?utf8=%E2%9C%93&search=${encodeURI(event.message.text)}`)
      const $ = cheerio.load(response.data)
      const $$ = cheerio.load(response1.data)
      // const $$$ = cheerio.load(response2.data)
      const flexarr = []
      let thistext = ''
      $('.panel-body').each(function () {
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
                text: $(this).find('.multi_ellipsis').text(),
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
                        text: $(this).find('.date').text(),
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
        thistext += $(this).text()
        flexarr.push(flex)
      })
      $$('#selling .thumbnail').each(function () {
        const flex1 = {
          type: 'bubble',
          hero: {
            type: 'image',
            url: $(this).find('img').attr('src'),
            size: 'full',
            aspectRatio: '850:370',
            aspectMode: 'fit',
            action: {
              type: 'uri',
              uri: 'https://tixcraft.com' + $$(this).find('a').attr('href')
            }
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: $$(this).find('.fcDark').text(),
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
                        text: $$(this).find('span').text(),
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
                  uri: 'https://tixcraft.com' + $$(this).find('a').attr('href')
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
        thistext += $$(this).find('a').text()
        flexarr.push(flex1)
      })
      // $$$('figure').each(function () {
      //   console.log($$$(this).html())
      // })
      const message = {
        type: 'flex',
        altText: thistext,
        contents: {
          type: 'carousel',
          contents: flexarr
        }
      }
      fs.writeFileSync('aaa.json', JSON.stringify(message, null, 2))
      event.reply(message)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
})
