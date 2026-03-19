This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Griddb API

initialize
``` bash
$ sudo su gsadm
[gsadm]$ cd ~
[gsadm]$ nano .bashrc
export GS_HOME=/usr/griddb-5.5.0
export GS_LOG=/var/lib/gridstore/log
[gsadm]$ source .bashrc
```

settings
``` bash
[gsadm]$ gs_passwd admin
  #input your_password
[gsadm]$ nano conf/gs_cluster.json
  #    "clusterName":"your_clustername" #<-- input your_clustername
[gsadm]$ gs_startnode
[gsadm]$ gs_joincluster -c sasaCluster -u admin/admin
```
run webapi(https://github.com/griddb/webapi)
export GS_WEBAPI_HOME=/var/lib/gridstore/webapi
$ sudo chmod -R 777 /var/lib/gridstore/webapi/log/

``` bash
java -jar build/libs/griddb-webapi-ce-5.9.0.jar
```

CORS setting
``` java
package com.toshiba.mwcloud.gs.tools.webapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/griddb/v2/**")
				.allowedOrigins("http://localhost:3000")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") ;
			}
		};
	}
}
```