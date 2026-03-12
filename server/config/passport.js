import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model.js';

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({
                    $or: [
                        { email: profile.emails[0].value },
                        { googleId: profile.id } // if you added it to model
                    ]
                });

                if (user) {
                    // If email matched but no google ID, link accounts
                    return done(null, user);
                }

                user = new User({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    isVerified: true, // OAuth emails are already verified
                    avatar: profile.photos[0]?.value,
                });

                await user.save();
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
            scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const primaryEmail = profile.emails?.find((e) => e.primary)?.value || profile.emails?.[0]?.value || `${profile.username}@github.com`;

                let user = await User.findOne({ email: primaryEmail });

                if (user) {
                    return done(null, user);
                }

                user = new User({
                    name: profile.displayName || profile.username,
                    email: primaryEmail,
                    isVerified: true,
                    avatar: profile.photos?.[0]?.value,
                });

                await user.save();
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

export default passport;
